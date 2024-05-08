
from fastapi import APIRouter
from datetime import datetime
from uuid import UUID, uuid4

from pydantic import BaseModel
from fastapi_pagination import Page, paginate


router = APIRouter(tags=["log"], prefix="/log")

@router.get("/getLogSummary")
async def get_log_summary():
    return {"message": "Get log summary"}

@router.get("/getAttributesList")
async def get_attributes_list():
    return {"message": "Get attributes list"}




@router.get("/getEventsList")
async def get_events_list():
    return paginate([])
    return {"message": "Get events list"}

@router.get("/getTracesList")
async def get_traces_list():
    return {"message": "Get traces list"}