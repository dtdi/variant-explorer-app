from typing import List, Mapping, Tuple
from pm4py.objects.log.obj import EventLog, Trace
from pandas import DataFrame

from models import Workspace, Aggregate, JobList, Job, Tree

current_workspace: Workspace = None
current_aggregate: Aggregate = None
event_log : DataFrame = None
tree: Tree = None

# performance statistics
df_joined : DataFrame = None
parameters : Mapping = {}

joblist = None


#variants : Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]] = {}