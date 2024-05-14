
from fastapi import APIRouter, Depends
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union, Optional
import pm4py
import json
import pandas as pd
from pm4py.util import constants
import cache.cache as cache
from pydantic import BaseModel

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)


router = APIRouter(tags=["columns"], prefix="/columns")


def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

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
    analysis_category: Optional[str]
    event_log_column: Optional[str]
    display_name: str
    type: str
    description: Optional[str] = None

@router.post("/editColumn/{workspace_id}")
async def edit_column(workspace_id: UUID, column: ColumnInput,repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()

    workspace = cache.current_workspace
    col = workspace.get_column(column.id)

    col.display_name = column.display_name
    col.type = column.type
    col.description = column.description
    col.analysis_category = column.analysis_category
    col.event_log_column = column.event_log_column
    col.infer_aggregate_column_type()

    workspace.update_column(col)

    conf.update_workspace(workspace)
    repo.save_configuration(conf)
    return workspace.columns

