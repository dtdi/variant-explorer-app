
from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime



class Split(BaseModel):
    id: UUID = None
    name: str
    description: str
    created_at: datetime
    can_edit: bool
    can_delete: bool
    log_file: str = None
    log_name: str = None
    type: str = None