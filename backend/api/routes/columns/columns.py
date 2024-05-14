
from fastapi import APIRouter
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union
import pm4py
import json
import pandas as pd
from pm4py.util import constants
import cache.cache as cache
from pydantic import BaseModel


router = APIRouter(tags=["columns"], prefix="/columns")

@router.get("/getColumns/{workspace_id}")
async def get_columns(workspace_id: UUID):
    workspace = cache.current_workspace
    columns = workspace.columns
    return columns

@router.get("/getColumn/{workspace_id}/{column_id}")
async def get_column(workspace_id: UUID, column_id: UUID):
    workspace = cache.current_workspace
    column = workspace.get_column(column_id)
    return column

@router.get("/getColumnByName/{workspace_id}/{column_name}")
async def get_column_by_name(workspace_id: UUID, column_name: str):
    workspace = cache.current_workspace
    column = workspace.get_column_by_name(column_name)
    return column

class ColumnInput(BaseModel):
    id: UUID
    name: str
    display_name: str
    type: str
    description: str = None

@router.post("/editColumn/{workspace_id}")
async def edit_column(workspace_id: UUID, column: ColumnInput,repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()

    workspace = cache.current_workspace
    col = workspace.get_column(column.id)
    col.name = column.name
    col.display_name = column.display_name
    col.type = column.type
    col.description = column.description
    col.infer_aggregate_column_type()
    workspace.update_column(column)

    model = conf.get_workspace(workspace.id)
    conf.update_workspace(model)
    repo.save_configuration(conf)
    return col

