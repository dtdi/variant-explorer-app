import abc
import yaml

from pathlib import Path
from appdirs import user_config_dir
import os
import errno

from datetime import datetime
from uuid import UUID, uuid4

from fastapi import logger

from pydantic import BaseModel

CONFIG_FILENAME = 'config.yaml'
DEFAULT_TIMEOUT = 2
APP_NAME = 'variant-explorer'
COMPANY_NAME = 'dtdi'

class WorkspaceModel(BaseModel):
    id: UUID = None
    name: str
    description: str
    created_at: datetime
    can_edit: bool
    can_delete: bool
    log_file: str = None
    log_name: str = None
    type: str = None

    def get_directory(self) -> Path: 
        return Path(os.getcwd()).joinpath( 'resources', 'workspaces' , str(self.id) )

    def ensure_directory(self):
        os.makedirs( self.get_directory() , exist_ok=True )


class Configuration():
    workspaces: list[WorkspaceModel]

    def __init__(self, name: str ="Variant Explorer", author: str="Tobias Fehrer",
                  authenticationMode: str="also-implicit", authorizationMode: str="bypassed",
                  enableDownload: bool=True, maxUploadSize: int=1073741824, pm4pyVersion: str="2.2.24",
                  sessionDuration: int=86400, version: str="1.0.27",
                   workspaces: list[WorkspaceModel] = [], timeout=DEFAULT_TIMEOUT):
        self.workspaces = workspaces
        self.timeout = timeout
        self.name = name
        self.author = author  
        self.authenticationMode = authenticationMode
        self.authorizationMode = authorizationMode
        self.enableDownload = enableDownload
        self.maxUploadSize = maxUploadSize
        self.pm4pyVersion = pm4pyVersion
        self.sessionDuration = sessionDuration
        self.version = version
        

    def get_workspace(self, workspace_id: UUID) -> WorkspaceModel:
        for w in self.workspaces:
            if w.id == workspace_id:
                return w

    def add_workspace(self, workspace: WorkspaceModel):
        workspace.ensure_directory()
        self.workspaces.append(workspace)

    def update_workspace(self, workspace: WorkspaceModel):
        for i, w in enumerate(self.workspaces):
            if w.id == workspace.id:
                self.workspaces[i] = workspace

    def delete_workspace(self, workspace_id: UUID):
        self.workspaces = [w for w in self.workspaces if w.id != workspace_id]
      


class ConfigurationRepository(abc.ABC):
    @abc.abstractmethod
    def save_configuration(self, config: Configuration):
        raise NotImplementedError

    @abc.abstractmethod
    def get_configuration(self) -> Configuration:
        raise NotImplementedError


class FileBasedConfigurationRepository(ConfigurationRepository):
    def save_configuration(self, config: Configuration):
        directory = user_config_dir(APP_NAME, COMPANY_NAME)
        filename = os.path.join(directory, CONFIG_FILENAME)
        self.__create_dir_if_not_exists(filename)

        with open(filename, 'w+', encoding='utf-8') as f:
            yaml.dump(config, f)

    def get_configuration(self) -> Configuration:
        directory = user_config_dir(APP_NAME, COMPANY_NAME)
        logger.logger.info(f"Loading configuration from file {directory}")

        if not Path(os.path.join(directory, CONFIG_FILENAME)).is_file():
            app_config = {
              "name":"Variant Explorer",
              "author": "Tobias Fehrer",
              "authenticationMode":"also-implicit",
              "authorizationMode":"bypassed",
              "enableDownload":True,
              "maxUploadSize":1073741824,
              "pm4pyVersion":"2.2.24",
              "sessionDuration":86400,
              "version":"1.0.27"            
            }
            workspaces = []
            workspaces.append(WorkspaceModel(
                id=uuid4(),
                name='BPI Challenge 2019 Sample',
                description='Default Workspace',
                created_at=datetime.now(),
                can_edit=True,
                can_delete=True,
                log_name="bpi_challenge_2019_sample",
                type="xes", 
                log_file="bpi_challenge_2019_sample.xes", 
                
              ))
            return Configuration(**app_config, workspaces=workspaces)
        with open(os.path.join(directory, CONFIG_FILENAME), 'r', encoding='utf-8') as f:
            configuation = yaml.load(f, Loader=yaml.Loader)
            return configuation

    # see https://stackoverflow.com/questions/12517451/automatically-creating-directories-with-file-output
    @staticmethod
    def __create_dir_if_not_exists(filename: str):
        if not os.path.exists(os.path.dirname(filename)):
            try:
                os.makedirs(os.path.dirname(filename))
            except OSError as exc:  # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise


class ConfigurationRepositoryCacheProxy(ConfigurationRepository):
    def __init__(self, config_repo: ConfigurationRepository):
        self.config_repo = config_repo
        self.cached_config = None

    def save_configuration(self, config: Configuration):
        self.config_repo.save_configuration(config)
        self.cached_config = config

    def get_configuration(self) -> Configuration:
        if self.cached_config is None:
            self.cached_config = self.config_repo.get_configuration()

        return self.cached_config


class ConfigurationRepositoryFactory:
    repo = ConfigurationRepositoryCacheProxy(FileBasedConfigurationRepository())

    @staticmethod
    def get_config_repository() -> ConfigurationRepository:
        return ConfigurationRepositoryFactory.repo