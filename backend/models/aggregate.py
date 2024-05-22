
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID, uuid4
from datetime import datetime
from pathlib import Path
from typing import Union, Optional
import pandas as pd
import models.workspace
from pmxplain import describe_meta
from models.aggregate_column import AggregateColumn
import models as models
from models.stats import Stats
from models.split import Split
import os
import cache.cache as cache



class Aggregate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    columns: list[AggregateColumn] = []
    id: Union[UUID,str] = uuid4()
    workspace_id: UUID
    name: str = ""
    description: str = ""
    created_at: datetime = datetime.now()
    can_edit: bool = True
    can_delete: bool = True
    split: Optional[Split] = None
    cases: pd.DataFrame = Field(default=None,exclude=True)
    meta: pd.DataFrame = Field(default=None,exclude=True)
    #activities: pd.DataFrame = Field(default=None,exclude=True)
    stats: Stats = Stats()

    @property
    def explanation(self):
        return { 
            
            'final_event_log_columns': 
              [{ 'name': col.name, 'value': col.representative_value } 
               for col in self.columns if col.is_final and col.event_log_column is not None],
            'final_columns':
              [{ 'name': col.name, 'value': col.representative_value } 
               for col in self.columns if col.is_final and col.event_log_column is None],
        }

    @property
    def llm_string(self):
        ret = ["\n"]
        ret.append(f"Aggregate: {self.name}")
        return "".join(ret)
    
    def get_column_by_name(self, column_name: str) -> AggregateColumn:
        for column in self.columns:
            if column.name == column_name:
                return column
        return None
    
    def get_column_by_event_log_column(self, event_log_column: str) -> AggregateColumn:
        for column in self.columns:
            if column.event_log_column == event_log_column:
                return column
        return None
        
    def ensure_meta(self):
        if self.meta is None:
            self.cases = self.cases.loc[:,~self.cases.columns.str.startswith('bin||')]
            self.meta = describe_meta(self.cases)

    def initialize(self,workspace: models.workspace.Workspace=None):
        if(workspace is None):
            workspace = cache.workspace

        self.ensure_meta()
        
        self.columns = []
        for series in self.meta.itertuples(index=True):
            col = workspace.get_column_by_name(series.Index)

            column = AggregateColumn(
              id=uuid4(),
              name=col.name,
              distinct_values=series.distinct_values,
              fraction_of_distinct_values=series.fraction_of_distinct_values,
              missing_values=series.missing_values,
              has_nan_values=series.has_nan_values,
              recommended_conversion=series.recommended_conversion,
              bin_sizes=series.bin_sizes,
              treat_as=series.treat_as,
              event_log_column=col.event_log_column,
              analysis_category=col.analysis_category,
            )
            column.init( self.cases, self.meta )
            self.columns.append( column )
        
        self.stats.number_cases = len(self.cases)
        self.stats.number_variants = int(self.cases['case:##variant_str'].nunique())
        self.stats.number_events = int(self.cases['case:##len'].sum())



    def boot(self):
        self.cases = pd.read_pickle(self.get_file('cases.pkl'))
        self.meta = pd.read_pickle(self.get_file('meta.pkl'))
        #self.activities = pd.read_pickle(self.get_file('activities.pkl'))

    def dump_files(self):
        self.cases.to_pickle(self.get_file('cases.pkl'))
        self.meta.to_pickle(self.get_file('meta.pkl'))
        #self.activities.to_pickle(self.get_file('activities.pkl'))

    @classmethod
    def from_json(cls, json: dict) -> 'Aggregate':
        return cls.model_validate_json(json, strict=False)
    
    @classmethod
    def _get_directory(cls, workspace_id: str, id: str) -> Path:
        return Path(os.getcwd()).joinpath('resources', 'workspaces', str(workspace_id), 'agg', str(id))
    
    @classmethod
    def _get_file(cls, workspace_id: str, id: str, file_name: str) -> Path:
        return Path(os.getcwd()).joinpath('resources', 'workspaces', str(workspace_id), 'agg',  str(id), file_name)

    def get_directory(self) -> Path: 
        return self._get_directory(workspace_id=self.workspace_id, id=self.id)
    
    def get_file(self, filename: str) -> Path:
        return self.get_directory().joinpath(filename)

    def ensure_directory(self):
        os.makedirs( self.get_directory() , exist_ok=True )

    def save(self):
      self.ensure_directory()
      self.dump_files()
      with open(self.get_file('aggregate.json'), 'w+') as f:
          f.write(self.model_dump_json())

    @classmethod
    def load(cls, workspace_id: UUID, id: Union[UUID,str]) -> 'Aggregate':
      try:
        with open(cls._get_file(workspace_id=workspace_id, id=str(id), file_name='aggregate.json'), 'r') as f:            
            agg = cls.from_json(f.read())
            agg.boot()
            return agg

      except FileNotFoundError:
        print(f"Aggregate not found: {cls._get_file(workspace_id=workspace_id, id=str(id), file_name='aggregate.json')}")
        return cls(workspace_id=workspace_id, id=id)
