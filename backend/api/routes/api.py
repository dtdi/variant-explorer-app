from fastapi import APIRouter

from api.routes.workspace import workspaces
from api.routes.log import log
from api.routes.aggregates import aggregates
from api.routes.cases import cases
from api.routes.settings import settings


router = APIRouter()
router.include_router(settings.router)
router.include_router(workspaces.router)
router.include_router(aggregates.router)
router.include_router(cases.router)
router.include_router(log.router)
