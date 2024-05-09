
from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from pathlib import Path
import shutil
import os
from models.aggregate import Aggregate

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