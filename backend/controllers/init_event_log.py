import os
from pathlib import Path
import logging

import asyncio
import pandas as pd

import concurrent.futures


from cache.state import Job
import cache.cache as cache

from pm4py.objects.log.importer.xes.importer import apply as xes_import
from pmxplain import setup_log

def _import_event_log(log_path: str, workspace_dir: str):
  ev = xes_import(log_path)
  df_joined, df_act, df_l, df_meta = setup_log(ev)
  df_joined.to_pickle( Path(workspace_dir).joinpath("df_joined.pkl") )
  df_l.to_pickle( Path(workspace_dir).joinpath("df_l.pkl") )
  df_act.to_pickle( Path(workspace_dir).joinpath("df_act.pkl") )
  df_meta.to_pickle( Path(workspace_dir).joinpath("df_meta.pkl") )



async def import_event_log(job: Job):
    log_name = job.data.get("log_name")
    workspace_dir = job.data.get("directory")

    logger = logging.getLogger('uvicorn')
    job.start_job()
    basepath = os.path.join(os.getcwd(), "lab", "data")
    
    logger.info(os.getcwd())
    if log_name is None or log_name == "":
      log_name = "bpi_challenge_2019_sample.xes"
    log_path = os.path.join(basepath, log_name)

    loop = asyncio.get_running_loop()

    with concurrent.futures.ProcessPoolExecutor() as pool:
        await loop.run_in_executor(pool, _import_event_log, log_path, workspace_dir)
    job.complete_job()
    return

async def load_workspace(job: Job): 
  workspace_dir = job.data.get("directory")
  if job.workspace_id == cache.current_workspace:
     return

  job.start_job()
  df_joined = pd.read_pickle(Path(workspace_dir).joinpath("df_joined.pkl"))
  cache.df_joined = df_joined

  df_l = pd.read_pickle(Path(workspace_dir).joinpath("df_l.pkl"))
  cache.event_log = df_l
  
  job.complete_job()
  return df_joined