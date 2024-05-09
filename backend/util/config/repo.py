import abc
import yaml

from pathlib import Path
from appdirs import user_config_dir
import os
import errno

from models import Workspace,Configuration

from datetime import datetime
from uuid import UUID, uuid4

from fastapi import logger


CONFIG_FILENAME = 'config.yaml'
DEFAULT_TIMEOUT = 2
APP_NAME = 'variant-explorer'
COMPANY_NAME = 'dtdi'





      


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
            workspaces = []
            workspaces.append(Workspace(
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
            return Configuration( author="Tobias Fehrer", name="Variant Explorer" , workspaces=workspaces)
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