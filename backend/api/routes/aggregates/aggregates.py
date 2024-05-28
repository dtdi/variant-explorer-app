
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union,Optional
from models import Aggregate, Tree
import pmxplain.algo.split.split as split
from pmxplain import abstract_aggregate
import json


import cache.cache as cache

from pydantic import BaseModel


from models import Workspace, Job, Aggregate

router = APIRouter(tags=["aggregates"], prefix="/aggregates")

class AggregateInput(BaseModel):
    aggregate_id: Union[str,UUID] = None
    workspace_id: UUID
    name: Optional[str] = None
    description: Optional[str] = None
    ai_magic: Optional[bool] = None

@router.post("/editAggregate")
async def edit_aggregate(d: AggregateInput):
  aggregate = cache.tree.get_node(d.aggregate_id).data
  if d.name:
    aggregate.name = d.name
  if d.description:
    aggregate.description = d.description

  if d.ai_magic:

    aggregate.description = abstract_aggregate(aggregate.get_llm_description())
  
  aggregate.save()
  return { "msg": "editAggregate", "aggregate": aggregate }

# todo! 
@router.delete("/deleteSplit/{split_id}")
async def delete_split(split_id: Union[str,UUID]):
  removed = []
  for node in cache.tree.all_nodes_itr():
    if node.data and node.data.split and node.data.split.id == split_id:
      removed.append(node._identifier)
  for node in removed:
    cache.tree.get_node(node).data.delete()
  cache.workspace.save()
  return { "msg": "deleteSplit", "split_id": split_id, "removed": removed}

@router.delete("/deleteChildren/{aggregate_id}")
async def delete_children(aggregate_id: Union[str,UUID]):
  children = cache.tree.children(aggregate_id)
  for child in children:
    cache.tree.remove_node(child._identifier)
  cache.workspace.save()
  return { "msg": "deleteChildren", "aggregate_id": aggregate_id, 'children': children }

@router.delete("/deleteAggregate/{aggregate_id}")
async def delete_aggregate(aggregate_id: Union[str,UUID]):
  aggregate = cache.tree.get_node(aggregate_id)
  parent = aggregate.predecessor(cache.tree._identifier)
  removed = list(cache.tree.expand_tree(aggregate_id))
  for node in removed:
    cache.tree.get_node(node).data.delete()
  cache.tree.remove_node(aggregate_id)
  cache.workspace.save()
  return { "msg": "deleteAggregate", "aggregate_id": aggregate_id, "removed": removed, 'parent_id': parent }

class SplitInput(BaseModel):
   aggregate_id: Union[str,UUID] = None
   workspace_id: UUID
   split_type: str = "groupBy"
   bins: Optional[int] = None
   q: Optional[int] = None
   query: Optional[str] = None
   by: list[str] = []

@router.post("/splitAggregate")
async def split_aggregate(d: SplitInput):
  tree: Tree = cache.tree
  node = tree.get_node(d.aggregate_id)

  if d.split_type == "group_by":
    splitter = split.GroupBySplit(d.by)
  elif d.split_type == "cut":
    splitter = split.CutSplit(d.by[0], d.bins)
  elif d.split_type == "q_cut":
    splitter = split.QCutSplit(d.by[0], d.q)
  else:
    return { "msg": "splitAggregate", "error": "Unknown split type" }

  tree.split_node(node, splitter)
  cache.workspace.save()

  return { "msg": "splitAggregate", "id": node._identifier }

@router.get("/{aggregate_id}")
async def get_aggregates(aggregate_id: Union[str,UUID] = None, up:int = None):
    tree = cache.tree
    if not tree:
        return { "msg": "No tree loaded" }
    
    if up:
      aggregate_id = tree.get_nid_x_levels(aggregate_id,levels=up)
    # optimization: only return the required data (Name, stats)
    return { "aggregates": tree.to_nav_dict(aggregate_id)}

@router.get("/{aggregate_id}/flat")
async def get_flat_aggregates(aggregate_id: Union[str,UUID] = None, projection: Optional[str] = 'children'):
    tree = cache.tree
    if not tree:
        return { "msg": "No tree loaded" }

    if projection == "children":
      nodes = tree.children( aggregate_id)
      
    elif projection == "subtree":
      subtree = tree.subtree( aggregate_id)
      nodes = subtree.all_nodes()

    workspace = cache.workspace
    out = []
    for node in nodes:
      nodeObj = {
        "id": node._identifier,
        "workspace_id": node.data.workspace_id,
        "name": node.data.name,
        "description": node.data.description,
        "split": node.data.split,
        "explanation": node.data.explanation,
        "stats": node.data.stats,
        "created_at": node.data.created_at,
        "bookmark": workspace.get_bookmark(node.data.bookmark_id) if node.data.bookmark_id else None,
        "can_edit": node.data.can_edit,
      }
      out.append(nodeObj)

    return { "aggregates": out }

@router.get("/{aggregate_id}/columns")
async def get_aggregate_columns(aggregate_id: Union[str,UUID] = None):
    columns = ['name', 'name_tech', 'category', 'has_nan_values',
       'distinct_values', 'fraction_of_distinct_values', 'missing_values',
       'recommended_conversion', 'bin_sizes', 'treat_as', 'mean',
      ]

    meta = cache.aggregate.meta[columns].to_json(orient='records')
    rows = json.loads(meta)

    columns = [ { "header": col, "field": col } for col in columns]
    
    return { "rows": rows, "columns": columns }