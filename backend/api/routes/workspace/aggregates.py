
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
from cache.state import joblist, Job
from typing import Union


import os
import pathlib

from pydantic import BaseModel

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
    WorkspaceModel
)

router = APIRouter(tags=["workspaces"], prefix="/workspaces")

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

@router.get("/{workspace_id}/{aggregate_id}")
async def get_workspaces(workspace_id: UUID, aggregate_id: Union[UUID,str] = None, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    workspace = conf.get_workspace(workspace_id=workspace_id)

    return { workspace, { "msg": True} }