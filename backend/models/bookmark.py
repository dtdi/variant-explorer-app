
from pydantic import BaseModel
from typing import Optional,Union
from uuid import UUID, uuid4
from datetime import datetime

class Bookmark(BaseModel):
    id: UUID = uuid4()
    name: str
    description: str
    aggregate: Union[UUID, None] = None
    related: list[Union[UUID, None] ] = []
    type: str = "bookmark"
    icon: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def add_related(self, related_id: UUID):
        self.related.append(related_id)

    def remove_related(self, related_id: UUID):
        for i, related in enumerate(self.related):
            if related == related_id:
                self.related.pop(i)
                break
            
    def get_related(self):
        return self.related
    
    @classmethod
    def from_dict(cls, data: dict):
        bookmark =  cls(**data)
        bookmark.created_at = datetime.now()