from fastapi import APIRouter

from api.routes.workspace import workspaces
from api.routes.log import log
from api.routes.charts import charts
from api.routes.collections import collections
from api.routes.aggregates import aggregates
from api.routes.cases import cases
from api.routes.settings import settings
from api.routes.columns import columns


router = APIRouter()
router.include_router(settings.router)
router.include_router(workspaces.router)
router.include_router(aggregates.router)
router.include_router(collections.router)
router.include_router(cases.router)
router.include_router(log.router)
router.include_router(charts.router)
router.include_router(columns.router)