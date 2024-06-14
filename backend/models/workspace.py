
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime
import pandas as pd
from typing import Union, Optional,Dict
from pathlib import Path
import shutil
import os
import models

class Workspace(BaseModel):
    id: UUID = None
    name: str
    description: str
    created_at: datetime
    can_view: bool = True
    can_edit: bool = True
    can_delete: bool = True
    log_file: str = None
    log_name: str = None
    type: str = None

    @property
    def data(self):
        return models.workspacedata.WorkspaceData.load(self.id)

    def get_directory(self) -> Path: 
        return Path(os.getcwd()).joinpath( 'resources', 'workspaces' , str(self.id) )
    
    def get_file(self, filename: str) -> Path:
        return self.get_directory().joinpath(filename)
    
    def clear_directory_except_log(self):
          directory = self.get_directory()
          for file in os.listdir(directory):
            if file != "log.pkl":
              file_path = os.path.join(directory, file)
              if os.path.isfile(file_path):
                os.remove(file_path)
              elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
    
    def clear_directory(self):
        shutil.rmtree(self.get_directory(), ignore_errors=True)        
        self.ensure_directory()

    def ensure_directory(self):
        os.makedirs( self.get_directory() , exist_ok=True )

class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_aggregates: int = 0