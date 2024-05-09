import logging
import pickle
from typing import Callable

from models import JobList, Job, Workspace

import cache.cache as cache
import pathlib
import controllers.init_event_log  as init_event_log

from util.multiprocessing.pool_factory import PoolFactory

import pandas as pd

from fastapi import FastAPI

logger = logging.getLogger("uvicorn")

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

def create_start_app_handler(
    app: FastAPI,
) -> Callable:
    async def start_app() -> None:
        logger.info("---------- Handling startup ----------")

        repo = ConfigurationRepositoryFactory.get_config_repository()
        conf = repo.get_configuration()
        cache.joblist = JobList()        
        print('loaded configuration', conf.author)
        if conf.current_workspace_id is not None:
            ws = conf.get_workspace(conf.current_workspace_id)

            job = Job( workspace_id=conf.current_workspace_id, job_name="load_workspace", job_data={"workspace": ws})
            await init_event_log.load_workspace(job)
            print('job', job)

        # create process pool
        PoolFactory.instance()
        repo.save_configuration(conf)
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("-------- Handling application stop -----------")
    return stop_app