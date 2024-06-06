
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union,Optional
from models import Aggregate, Tree
import pmxplain.algo.split.split as split
import json


import cache.cache as cache

from pydantic import BaseModel


from models import Bookmark

router = APIRouter(tags=["collections"], prefix="/collections")

class BookMarkInput(BaseModel):
    id: Optional[UUID] = None
    aggregate_id: Union[str,UUID] = None
    workspace_id: UUID
    name: str
    description: str = None
    icon: Optional[str] = None

@router.get("/{workspace_id}/getBookmarks")
async def get_bookmarks(workspace_id: UUID):
  return { "msg": "getBookmarks", "bookmarks": cache.workspace.collection }

@router.get("/getBookmark/{bookmark_id}")
async def get_bookmark(bookmark_id: UUID):
  bookmark = cache.workspace.get_bookmark(bookmark_id)
  return { "msg": "getBookmark", "bookmark": bookmark }

@router.post("/addBookmark")
@router.post("/editBookmark")
async def edit_or_add_bookmark(d: BookMarkInput):
  if d.id:
    bookmark = cache.workspace.get_bookmark(d.id)
    bookmark.name = d.name
    bookmark.description = d.description
    bookmark.icon = d.icon
    cache.workspace.save()
    return { "msg": "editBookmark", "bookmark": bookmark }
  else:
    aggregate = cache.tree.get_node(d.aggregate_id).data
    bookmark = Bookmark(
      id=uuid4(),
      name=d.name,
      description=d.description,
      icon=d.icon,
      aggregate=aggregate.id,
      workspace_id=d.workspace_id
    )
    cache.workspace.add_bookmark(bookmark)
  aggregate.bookmark_id = bookmark.id
  aggregate.save()
  cache.workspace.save()
  return { "msg": "editBookmark", "bookmark": bookmark }

