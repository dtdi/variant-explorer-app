
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
from models import Column

router = APIRouter(tags=["cases"], prefix="/cases")

class CaseInput(BaseModel):
    workspace_id: UUID
    aggregate_id: Union[UUID,str]
    page: int = 0
    page_size: int = 10
    columns: list[int] = [1,2,26,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,27]
    sortings: str = None

@router.post("/")
async def get_cases(c: CaseInput):
    df: pd.DataFrame = cache.current_aggregate.cases.reset_index()

    all_columns: list[Column] = cache.current_aggregate.columns

    df.rename(columns={col.name: col.name_tech for col in all_columns}, inplace=True,)
    
    start_index = (c.page) * c.page_size
    end_index = start_index + c.page_size

    out = df.iloc[start_index:end_index]

  
    columns = []
    for c_idx in c.columns:
        column = next((col for col in all_columns if col.name_tech == c_idx), None)
        if column:
            column = {
            'header': column.display_name,
            'field': str(column.name_tech),
            }
            columns.append(column)

    rows = json.loads(out.to_json(orient='records'))

    table_data = {
        "total": len(df),
        "page": c.page,
        "page_size": c.page_size,
    }
    
    return { "columns": columns, "cases": rows, "table_data": table_data}



