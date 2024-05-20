import os
import logging
import traceback
import asyncio
import pandas as pd

import concurrent.futures


from models import Workspace, Job, Aggregate, Tree, WorkspaceData
from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)
import cache.cache as cache

from pmxplain import import_log, generate_features, describe_meta

def _refresh_tree(workspaceData: WorkspaceData, cases, meta):
    aggregate = Aggregate(
      id="root",
      name="Root", 
      workspace_id=workspaceData.id, 
      cases=cases, 
      meta=meta)
    
    aggregate.initialize(workspace=workspaceData)
    aggregate.save()

    tree = Tree()
    tree.create_node(aggregate.id, aggregate.id, data=aggregate)
    workspaceData.tree = tree
    workspaceData.save()

def _import_event_log(log_path: str, workspace: Workspace):
  try:
    workspace.clear_directory()
    event_log = import_log(log_path)
    event_log.to_pickle(workspace.get_file("log.pkl"))
    cases, activities = generate_features(event_log)
    meta = describe_meta(cases)

    workspaceData = workspace.data
    workspaceData.init_columns(meta)
    cache.workspace = workspaceData

    print("config saved")
    _refresh_tree(workspaceData, cases, meta)
    
    workspaceData.save()

   
  except Exception as e:
    traceback.print_exc()

async def import_event_log(job: Job):
    log_name = job.data.get("log_name")
    workspace: Workspace = job.data.get("workspace")

    logger = logging.getLogger('uvicorn')
    job.start_job()
    basepath = os.path.join(os.getcwd(), "lab", "data")
    
    logger.info(os.getcwd())
    if log_name is None or log_name == "":
      log_name = "bpi_challenge_2019_sample.xes"
    log_path = os.path.join(basepath, log_name)

    loop = asyncio.get_running_loop()

    with concurrent.futures.ProcessPoolExecutor() as pool:
        await loop.run_in_executor(pool, _import_event_log, log_path, workspace)
    job.complete_job()
    return

async def load_workspace(job: Job): 
  job.start_job()

  workspace_id = job.workspace_id

  if cache.workspace is not None and workspace_id == cache.workspace.id:
    job.complete_job()
    return cache.workspace

  repo = ConfigurationRepositoryFactory.get_config_repository()
  conf = repo.get_configuration()
  workspace: Workspace = conf.get_workspace(workspace_id=workspace_id)

  conf.current_workspace_id = workspace.id
  repo.save_configuration(conf)


  # load workspace, test if it must be initialized. 
  if not os.path.exists(workspace.get_file("agg")):
    import_job = Job(
      workspace_id=workspace_id, 
      job_name="import_event_log", 
      job_data={"workspace": workspace})
    cache.joblist.add_job(import_job)
    await import_event_log(import_job)
  
  workspaceData: WorkspaceData = WorkspaceData.load(job.workspace_id)
  workspaceData.name = workspace.name
  workspaceData.description = workspace.description

  cache.workspace = workspaceData
  cache.tree = workspaceData.load_tree()
  cache.aggregate = cache.tree.get_node("root").data
  cache.event_log = pd.read_pickle(workspaceData.get_file("log.pkl"))
  job.complete_job()