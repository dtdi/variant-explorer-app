
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
import cache.cache as cache
from typing import Union
import pandas as pd

from models.workspace import Workspace
from models.job import Job
from models.stats import Stats


import cache.cache as cache
from pathlib import Path

from pydantic import BaseModel

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

from controllers.init_event_log import import_event_log, load_workspace

router = APIRouter(tags=["workspaces"], prefix="/workspaces")

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

class WorkspaceInput(BaseModel):
    id: UUID = None
    name: str
    description: str = None
    log_file: str = None
    log_name: str = None

class WorkspaceMin(BaseModel):
    id: UUID

@router.get("/getWorkspaceColumns/{workspace_id}")
async def get_workspace_columns(workspace_id: UUID, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    workspace: Workspace = conf.get_workspace(workspace_id=workspace_id)

    conf.current_workspace_id = workspace.id
    repo.save_configuration(conf)
    
    load_job = Job(
      workspace_id=workspace_id, 
      job_name="load_workspace"
    )

    cache.joblist.add_job( load_job )
    await load_workspace(load_job)
    

@router.post("/editWorkspace")
@router.post("/createWorkspace")
async def create_workspace(d: WorkspaceInput, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    if not d.id:
      model = Workspace(
          id=uuid4(),
          name=d.name,
          description=d.description,
          created_at=datetime.now(),
          can_edit=True,
          can_delete=True,
          log_file=d.log_file if d.log_file else "",
          log_name=d.log_name if d.log_name else "",
          type="xes"
      )
      conf.add_workspace(model)
    else:
      model = conf.get_workspace(d.id)
      model.name = d.name
      model.description = d.description
      model.log_file = d.log_file
      model.log_name = d.log_name
      conf.update_workspace(model)

    repo.save_configuration(conf)
    return model

@router.post("/deleteWorkspace")
async def delete_workspace(d: WorkspaceMin, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    conf.delete_workspace(d.id)
    return {"message": f"Workspace deleted with id: {d.id}"}

@router.get("/getWorkspaces")
async def get_workspaces(repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    return conf.workspaces

async def _load_workspace(id: UUID, repo: ConfigurationRepository):
       
    load_job = Job(
      workspace_id=id, 
      job_name="load_workspace",
    )

    cache.joblist.add_job( load_job )
    workspace = await load_workspace(load_job)
    return workspace

@router.get("/getWorkspaces/{workspace_id}")
async def get_workspaces(workspace_id: UUID, repo: ConfigurationRepository = Depends(get_config_repo)):
    workspace = await _load_workspace(id=workspace_id, repo=repo)
    return { "workspace": workspace }

@router.get("/getWorkspace/{workspace_id}/{aggregate_id}")
async def get_workspace(workspace_id: UUID, 
                         aggregate_id: Union[UUID,str], 
                         background_tasks: BackgroundTasks,
                         repo: ConfigurationRepository = Depends(get_config_repo)):
    
    workspace = await _load_workspace(id=workspace_id, repo=repo)
    
    tree = cache.tree
    node = tree.get_node(str(aggregate_id))
    breadcrumbs, level = tree.get_breadcrumbs(node.identifier)
    cache.aggregate = node.data

    return { "workspace": workspace, "aggregate": node, "stats": node.data.stats,"breadcrumbs": breadcrumbs, "level": level}

@router.post("/initLog") 
async def init_log(d: WorkspaceMin, background_tasks: BackgroundTasks, repo: ConfigurationRepository = Depends(get_config_repo), ):
    conf = repo.get_configuration()
    workspace = conf.get_workspace(d.id)
    workspace.ensure_directory()

    import_job = Job(job_name="init_log", workspace_id=workspace.id, 
                     job_data={ "log_file": workspace.log_file, "workspace": workspace })

    cache.joblist.add_job( import_job )
    background_tasks.add_task(import_event_log, import_job)

    return import_job