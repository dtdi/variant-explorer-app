
from pydantic import BaseModel
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional



class Split(BaseModel):
    id: UUID = uuid4()
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    created_at: datetime = datetime.now()