import os
from pathlib import Path
import logging
import json
import traceback
import shutil
import asyncio
import pandas as pd

import concurrent.futures

from models import Workspace, Job, Stats, Aggregate, Tree

import cache.cache as cache

from pmxplain import import_log, generate_features, describe_meta

def _import_event_log(log_path: str, workspace: Workspace):
  try:
    workspace.clear_directory()
    event_log = import_log(log_path)
    event_log.to_pickle(workspace.get_file("log.pkl"))
    cases, activities = generate_features(event_log)
    meta = describe_meta(cases)
    tree = Tree()
    aggregate = Aggregate(
      id="root",
      name=workspace.name, 
      workspace_id=workspace.id, 
      cases=cases, 
      meta=meta)
    aggregate.initialize()
    aggregate.save()
    tree.create_node("root", "root", data=aggregate)
    tree.save_to_file(workspace.get_file("tree.json"))
   
   
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
  workspace:Workspace = job.data.get("workspace")
  job.start_job()

  if cache.current_workspace is not None and workspace.id == cache.current_workspace.id:
    job.complete_job()
    print("workspace already loaded")
    return

  if not os.path.exists(workspace.get_file("tree.json")):
    import_job = Job(
      workspace_id=workspace.id, 
      job_name="import_event_log", 
      job_data={"workspace": workspace})
    cache.joblist.add_job(import_job)
    await import_event_log(import_job)
  
  cache.current_workspace = workspace
  cache.tree = Tree.from_file(workspace.get_file("tree.json"), workspace_id=workspace.id)
  cache.current_aggregate = cache.tree.get_node("root").data
  cache.event_log = pd.read_pickle(workspace.get_file("log.pkl"))
   
  job.complete_job()