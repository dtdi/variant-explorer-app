
from fastapi import APIRouter
from datetime import datetime
from uuid import UUID, uuid4
from typing import Union
import pm4py
import pandas as pd
from pm4py.algo.filtering.dfg import dfg_filtering
from pm4py.util import constants
import cache.cache as cache
from pydantic import BaseModel
from fastapi_pagination import Page, paginate


router = APIRouter(tags=["log"], prefix="/log")

class DiagramInput(BaseModel):
    activitiesSlider: float = 0.03
    activityKey: str = 'concept:name'
    workspace: UUID = None
    aggregate: Union[UUID,str] = None
    decoration: str = 'freq'
    pathsSlider: float = 0.05
    performanceAgg: str = "mean"
    frequencyMeasure: str = "overall"
    dependencyTreshold: float = -1

@router.post("/diagram")
async def get_diagram(d: DiagramInput): 
  
  cases = cache.current_aggregate.cases
  df_l = cache.event_log

  df_l = df_l[df_l['case:concept:name'].isin(cases.index)]
  df_v = pm4py.analysis.insert_artificial_start_end(df_l)

  dfg, sa, ea, act_count = __get_freq_perf_df(
     dataframe=df_v,
     decoration=d.decoration,
     activity_key=d.activityKey, 
     aggregation_measure=d.performanceAgg,
    activity_percentage=d.activitiesSlider,
     paths_percentage=d.pathsSlider,
     dependency_threshold=d.dependencyTreshold,
     business_hours=False
  )

  nodes = []
  spacer = 0
  for k,v in act_count.items(): 
    node = { 'id': k, 'data': { 'label': k, 'value': v}, 'position': {'x': 0, 'y': spacer} }
    spacer = spacer + 20
    if k == '■':
      node['type']='output'
    if k== '▶':
      node['type']='input'
    nodes.append(node)

  edges = []
  for key, value in dfg.items():
      source, target = key
      edge = {
        'id': f"{source}-{target}",
        'source': source,
        'target': target,
        'label': f"{value}",
        "type": 'smoothstep'
      }
      edges.append(edge)

  return {
    'nodes': nodes, 'edges': edges
  }


def __get_freq_perf_df(dataframe: pd.DataFrame, activity_key: str, aggregation_measure: str, activity_percentage: float,
                       paths_percentage: float, dependency_threshold: float, decoration: str="freq", business_hours: bool = False, business_hour_slots=constants.DEFAULT_BUSINESS_HOUR_SLOTS, workcalendar=constants.DEFAULT_BUSINESS_HOURS_WORKCALENDAR,):
    """
    Gets the frequency and performance DFG abstractions from the provided dataframe
    (internal usage)
    """
    freq_dfg, sa, ea = pm4py.discover_dfg(dataframe)
    act_count = pm4py.get_event_attribute_values(dataframe, activity_key)

    freq_dfg, sa, ea, act_count = dfg_filtering.filter_dfg_on_activities_percentage(freq_dfg, sa, ea, act_count,activity_percentage)
    freq_dfg, sa, ea, act_count = dfg_filtering.filter_dfg_on_paths_percentage(freq_dfg, sa, ea, act_count,paths_percentage)
    freq_dfg, sa, ea, act_count = dfg_filtering.filter_dfg_keep_connected(freq_dfg, sa, ea, act_count,dependency_threshold)

    if decoration == "freq":
        return freq_dfg, sa, ea, act_count

    perf_dfg, sa, ea = pm4py.discover_performance_dfg(dataframe, business_hours=business_hours, business_hour_slots=business_hour_slots, workcalendar=workcalendar)
    perf_dfg = {x: y[aggregation_measure] for x, y in perf_dfg.items() if x in freq_dfg}

    return perf_dfg, sa, ea, act_count

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