
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union
from models import Aggregate, Tree
import pmxplain.algo.split.split as split

import cache.cache as cache

from pydantic import BaseModel

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

from models import Workspace, Job, Aggregate

router = APIRouter(tags=["aggregates"], prefix="/aggregates")

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

class AggregateInput(BaseModel):
    id: Union[str,UUID] = None
    workspace_id: UUID
    name: str
    description: str = None

@router.post("/editAggregate")
async def edit_aggregate(d: AggregateInput):
  return { "msg": "editAggregate" }

class SplitInput(BaseModel):
   aggregate_id: Union[str,UUID] = None
   workspace_id: UUID
   split_type: str = "groupBy"
   by: str

@router.post("/splitAggregate")
async def split_aggregate(d: SplitInput):
  tree: Tree = cache.tree
  node = tree.get_node(d.aggregate_id)

  if d.split_type == "groupBy":
    splitter = split.GroupBySplit([d.by])
  else:
    splitter = split.GroupBySplit([d.by])

  tree.split_node(node, splitter=splitter)
  tree.save_to_file(cache.current_workspace.get_file("tree.json"))
  return { "msg": "splitAggregate", "id": node._identifier }

@router.get("/{aggregate_id}")
async def get_aggregates(aggregate_id: Union[str,UUID] = None, up:int = None):
    tree = cache.tree
    if not tree:
        return { "msg": "No tree loaded" }
    if up:
      aggregate_id = tree.get_nid_x_levels(aggregate_id,levels=up)
      tree_dict = tree.to_dict(aggregate_id,with_data=True)
    
    return { "aggregates": tree.to_dict(aggregate_id,with_data=True)}