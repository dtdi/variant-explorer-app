from collections import defaultdict


import cache.cache as cache

import pm4py.objects.log.importer.xes.importer as xes_importer

from controllers.load_event_log import calculate_event_log_properties

from util.config.repository import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

from fastapi import APIRouter, Depends, File, UploadFile

from pm4py.objects.log.importer.xes.importer import apply as xes_import

from pydantic import BaseModel

router = APIRouter(tags=["importing"], prefix="/importing")

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

@router.post("/uploadfile")
async def create_upload_file(
        file: UploadFile = File(...),
        config_repo: ConfigurationRepository = Depends(get_config_repo),
):
    cache.pcache = {}

    content = "".join([line.decode("UTF-8") for line in file.file])
    event_log = xes_importer.deserialize(content)
    use_mp = (
      len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    )
    info = calculate_event_log_properties(event_log, use_mp=use_mp)
    return info


class FilePathInput(BaseModel):
    file_path: str
  
@router.post("/loadEventLog")
async def load_event_log_from_file_path(
        d: FilePathInput, config_repo: ConfigurationRepository = Depends(get_config_repo)
):
    cache.pcache = {}
    event_log = xes_import(d.file_path)

    use_mp = (
      len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    )
    info = calculate_event_log_properties(event_log, use_mp=use_mp)
    return info