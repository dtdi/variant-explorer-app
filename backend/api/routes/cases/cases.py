
from fastapi import APIRouter
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union
import pm4py
import json
import pandas as pd
from pm4py.algo.filtering.dfg import dfg_filtering
from pm4py.util import constants
import cache.cache as cache
from pydantic import BaseModel
from fastapi_pagination import Page, paginate


router = APIRouter(tags=["cases"], prefix="/cases")

class CaseInput(BaseModel):
    workspace_id: UUID
    aggregate_id: Union[UUID,str]
    page: int = 1
    page_size: int = 10
    sortings: str = None

@router.post("/")
async def get_cases(c: CaseInput):
    df: pd.DataFrame = cache.current_aggregate.cases
    meta: pd.DataFrame = cache.current_aggregate.meta
    out = df.iloc[0:30]
    
    return json.loads(out.to_json(orient='records')) 



