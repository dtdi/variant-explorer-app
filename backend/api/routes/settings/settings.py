
from fastapi import APIRouter, Depends, BackgroundTasks
from datetime import datetime
from uuid import UUID, uuid4
import cache.cache as cache
from typing import Union
import pandas as pd

from models import Workspace, Job, Stats


import cache.cache as cache
from pathlib import Path


from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

from models import Configuration, Setting

def get_config_repo() -> ConfigurationRepository:
    return ConfigurationRepositoryFactory.get_config_repository()

router = APIRouter(tags=["settings"], prefix="/settings")



@router.post("/")
async def set_setting(d: Setting, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    conf.set_setting(d.name, d.value, d.type)
    repo.save_configuration(conf)
    return conf.get_setting(d.name)

@router.get("/{name}")
async def get_setting(name: str, repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    return conf.get_setting(name)

@router.get("/")
async def get_settings(repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    return conf.get_settings()