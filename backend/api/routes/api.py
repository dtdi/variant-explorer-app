from fastapi import APIRouter

from api.routes.configuration import configuration
from api.routes.importing import importing
from api.routes.workspace import workspaces, aggregates
from api.routes.log import log


router = APIRouter()
router.include_router(configuration.router)
router.include_router(importing.router)
router.include_router(workspaces.router)
router.include_router(aggregates.router)

router.include_router(log.router)
