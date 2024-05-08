from typing import List, Mapping, Tuple
from pm4py.objects.log.obj import EventLog, Trace
from pandas import DataFrame
import uuid

event_log : EventLog = None
# performance statistics
current_workspace: uuid.UUID = None
df_joined : DataFrame = None
parameters : Mapping = {}

#variants : Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]] = {}