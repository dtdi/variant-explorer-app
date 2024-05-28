from typing import Mapping
from pandas import DataFrame

from models.workspacedata import WorkspaceData
from models.tree import Tree
from models.aggregate import Aggregate
from models.job import JobList

workspace: WorkspaceData = None
aggregate: Aggregate = None
event_log : DataFrame = None
root: Aggregate = None
tree: Tree = None
collections: None

# performance statistics
df_joined : DataFrame = None
parameters : Mapping = {}

joblist:JobList  = None

def clear():
  workspace = None
  aggregate = None
  event_log = None
  root = None
  tree = None
  collections = None
  df_joined = None
  parameters = {}
