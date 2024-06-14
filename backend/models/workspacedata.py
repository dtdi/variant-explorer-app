
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID, uuid4
from datetime import datetime
import pandas as pd
from typing import Union, Optional, Dict, Tuple
from pathlib import Path
import os
from models.column import Column
from models.bookmark import Bookmark
from models.tree import Tree
from models.workspace import Workspace


class WorkspaceData(BaseModel): 
    model_config = ConfigDict(arbitrary_types_allowed=True)
    columns: Optional[list[Column]] = []
    collection: list[Bookmark] = []
    id: UUID
    name: Optional[str] = None
    description: Optional[str] = None
    tree: Optional[Tree] = Field(default=None, exclude=True)
    activity_features: Optional[Dict[str, Tuple]] = None


    def load_tree(self) -> Tree:        
        self.tree = Tree.from_file(self.get_file('tree.json'), self.id)
        return self.tree

    def get_bookmark(self, bookmark_id: UUID) -> Bookmark:
        
        for bookmark in self.collection:
            if bookmark.id == bookmark_id:
                print(bookmark.id, bookmark_id)
                return bookmark
        return None
    
    def get_bookmark_by_aggregate(self, aggregate_id: Union[str,UUID]) -> Bookmark:
        for bookmark in self.collection:
            if bookmark.aggregate == aggregate_id:
                return bookmark
        return None
    
    def add_bookmark(self, bookmark: Bookmark):
        self.collection.append(bookmark)
    
    def remove_bookmark(self, bookmark_id: UUID):
        for i, bookmark in enumerate(self.collection):
            if bookmark.id == bookmark_id:
                self.collection.pop(i)
                break
    
    def get_bookmarks(self):
        return self.collection

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
        column.init()
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

    @classmethod
    def from_json(cls, json: dict) -> 'WorkspaceData':
        return cls.model_validate_json(json, strict=False)
    
    @classmethod
    def _get_directory(cls, workspace_id: UUID) -> Path:
        return Path(os.getcwd()).joinpath('resources', 'workspaces', str(workspace_id))
    
    @classmethod
    def _get_file(cls, workspace_id: UUID, file_name: str) -> Path:
        return Path(os.getcwd()).joinpath('resources', 'workspaces', str(workspace_id), file_name)

    def get_directory(self) -> Path: 
        return self._get_directory(workspace_id=self.id)
    
    def get_file(self, filename: str) -> Path:
        return self.get_directory().joinpath(filename)

    def ensure_directory(self):
        os.makedirs( self.get_directory() , exist_ok=True )

    def save(self):
      self.ensure_directory()
      self.dump_files()
      with open(self.get_file('workspace.json'), 'w+') as f:
          f.write(self.model_dump_json())

    def dump_files(self):
      if self.tree:
        self.tree.save_to_file(self.get_file('tree.json'))
      pass
    
    def boot(self):
      self.load_tree()

    @classmethod
    def load(cls, workspace_id: UUID) -> 'WorkspaceData':
      file = cls._get_file(workspace_id=workspace_id, file_name='workspace.json')            
      try:
        with open(file, 'r') as f:            
            workspace = cls.from_json(f.read())
            workspace.boot()
            return workspace

      except FileNotFoundError:
        print(f"there is an rerror : {file}")
        workspace = cls(id=workspace_id)
        workspace.boot()
        return workspace

class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_aggregates: int = 0