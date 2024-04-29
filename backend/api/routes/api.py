from fastapi import APIRouter

from api.routes.configuration import configuration
from api.routes.importing import importing


router = APIRouter()
router.include_router(configuration.router)
router.include_router(importing.router)
