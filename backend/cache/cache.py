from typing import List, Mapping, Tuple
from pm4py.objects.log.obj import EventLog, Trace



event_log : EventLog = None
# performance statistics
pcache : Mapping = {}

parameters : Mapping = {}

#variants : Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]] = {}