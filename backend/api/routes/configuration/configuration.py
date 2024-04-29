from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from util.config.repository import Configuration as DomainConfiguration
from util.config.repository import (
    ConfigurationRepository, ConfigurationRepositoryFactory)

router = APIRouter(
    tags=["config"],
    prefix="/config"
)

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

class Configuration(BaseModel):
    
    class Config:
        populate_by_name = True

@router.get('/app')
async def get_app_config(config_repo: ConfigurationRepository = Depends(get_config_repo)):
    config = config_repo.get_configuration()
    dto = Configuration()
    return dto

@router.post('/app')
async def set_app_config(config_repo: ConfigurationRepository = Depends(get_config_repo)):
    config = config_repo.get_configuration()
    dto = Configuration()
    return dto