from typing import List, Mapping, Tuple
from pandas import DataFrame

from models.workspacedata import WorkspaceData
from models.tree import Tree
from models.aggregate import Aggregate
from models.job import JobList

workspace: WorkspaceData = None
aggregate: Aggregate = None
event_log : DataFrame = None
tree: Tree = None
collections: None

# performance statistics
df_joined : DataFrame = None
parameters : Mapping = {}

joblist:JobList  = None


#variants : Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]] = {}