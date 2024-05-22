
from fastapi import APIRouter
from uuid import UUID, uuid4
from typing import Union, Optional
import json
import pandas as pd
import cache.cache as cache
from pydantic import BaseModel
from models import Column

router = APIRouter(tags=["cases"], prefix="/cases")

class CaseInput(BaseModel):
    workspace_id: UUID
    aggregate_id: Union[UUID,str]
    page: int = 0
    page_size: int = 10
    columns: Optional[list[int]] = None
    sortings: str = None

@router.post("/")
async def get_cases(c: CaseInput):
    df: pd.DataFrame = cache.aggregate.cases

    all_columns: list[Column] = sorted( list(filter( lambda x: x.visible and not x.is_final , cache.aggregate.columns)) , key=lambda x: x.order)

    df = df.rename(columns={col.name: col.name_tech for col in all_columns}, inplace=False,)
    
    start_index = (c.page) * c.page_size
    end_index = start_index + c.page_size

    out = df.iloc[start_index:end_index]
  
    columns = []

    if c.columns is None:
        col_order = [col.name_tech for col in all_columns]
    else:
        col_order = c.columns

    for c_idx in col_order:
        agg_col = next((col for col in all_columns if col.name_tech == c_idx), None)
        if agg_col is None:
            continue
        columns.append(agg_col.column_head)
        out[agg_col.name_tech] = out[agg_col.name_tech].map(agg_col.mutate_values)

    rows = json.loads(out.to_json(orient='records'))

    table_data = {
        "total": len(df),
        "page": c.page,
        "page_size": c.page_size,
    }
    
    return { "columns": columns, "cases": rows, "table_data": table_data}