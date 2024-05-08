
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
from cache.state import joblist, Job
from typing import Union
import pandas as pd


import os
from pathlib import Path

from pydantic import BaseModel

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
    WorkspaceModel
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

@router.post("/editWorkspace")
@router.post("/createWorkspace")
async def create_workspace(d: WorkspaceInput, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    if not d.id:
      model = WorkspaceModel(
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

@router.get("/getWorkspace/{workspace_id}/{aggregate_id}")
async def get_workspaces(workspace_id: UUID, 
                         aggregate_id: Union[UUID,str], 
                         background_tasks: BackgroundTasks,
                         repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    workspace = conf.get_workspace(workspace_id=workspace_id)
    
    load_job = Job(
        workspace_id=workspace_id, 
        job_name="load_workspace",
        job_data={ "directory": workspace.get_directory()}
      )

    joblist.add_job( load_job )

    background_tasks.add_task(load_workspace, load_job)

    df_meta = pd.read_pickle(Path(workspace.get_directory()).joinpath("df_meta.pkl"))
    df_meta.drop(columns=["mean","min","25%","50%","75%", "max", "std"], inplace=True)
    cols = {}
    for a,b in df_meta.iterrows():
        cols[a] = dict(b)

    return { "workspace": workspace, "aggregate": str(cols) }

@router.post("/initLog") 
async def init_log(d: WorkspaceMin, background_tasks: BackgroundTasks, repo: ConfigurationRepository = Depends(get_config_repo), ):
    conf = repo.get_configuration()
    workspace = conf.get_workspace(d.id)
    workspace.ensure_directory()

    import_job = Job(job_name="init_log", workspace_id=workspace.id, 
                     job_data={ "log_file": workspace.log_file, "directory": workspace.get_directory() })

    joblist.add_job( import_job )
    background_tasks.add_task(import_event_log, import_job)

    return import_job