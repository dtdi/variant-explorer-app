
from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
import pandas as pd
from pathlib import Path
import shutil
import os
from models.column import Column

class Workspace(BaseModel):
    id: UUID = None
    name: str
    description: str
    created_at: datetime
    can_edit: bool
    can_delete: bool
    log_file: str = None
    log_name: str = None
    type: str = None
    columns: list[Column] = []

    def init_columns(self, meta: pd):
      self.columns = []
      for col in meta.itertuples(index=True):
        column = Column(
            id=uuid4(), 
            name=col.Index,
            display_name=col.name,
            name_tech=col.name_tech,
            type=col.category,
            description=""
        )
        column.infer_aggregate_column_type()
        self.columns.append( column )

    def get_column(self, column_id: UUID) -> Column:
        for column in self.columns:
            if column.id == column_id:
                return column
        return None
    
    def get_column_by_name(self, column_name: str) -> Column:
        for column in self.columns:
            if column.name == column_name:
                return column
        return None
  
    
    def get_column_by_event_log_column(self, event_log_column: str) -> Column:
        for column in self.columns:
            if column.event_log_column == event_log_column:
                return column
        return None
  

    def update_column(self, column: Column):
        for i, col in enumerate(self.columns):
            if col.id == column.id:
                self.columns[i] = column
                break
      

    def get_directory(self) -> Path: 
        return Path(os.getcwd()).joinpath( 'resources', 'workspaces' , str(self.id) )
    
    def get_file(self, filename: str) -> Path:
        return self.get_directory().joinpath(filename)
    
    def clear_directory(self):
        shutil.rmtree(self.get_directory(), ignore_errors=True)
        self.ensure_directory()

    def ensure_directory(self):
        os.makedirs( self.get_directory() , exist_ok=True )

class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_aggregates: int = 0