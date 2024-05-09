

import pm4py
import pandas as pd
from pm4py.objects.log.importer.xes.importer import apply as xes_import


def apply(log_path: str):
  event_log = xes_import(log_path)
  event_log = pm4py.insert_case_arrival_finish_rate(event_log)
  event_log = pm4py.insert_case_service_waiting_time(event_log)

  # Convert columns starting with '@@' to timedelta
  for col in event_log.columns:
      if col.startswith('@@'):
          event_log['case:'+col] = pd.to_timedelta(event_log[col], unit='s')
          event_log = event_log.drop(columns=[col])
  return event_log