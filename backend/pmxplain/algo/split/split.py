import pandas as pd
from abc import ABC, abstractmethod
from models.split import Split as SplitModel
from models.aggregate import Aggregate
from uuid import UUID, uuid4


class Split(ABC):
  """
  Abstract base class for split operations.

  Attributes:
    split_instance (SplitModel): An instance of the SplitModel class.

  Methods:
    __init__(): Initializes the Split class.
    __str__(): Returns a string representation of the Split class.
    split(df): Abstract method for splitting a DataFrame.

  """

  split_model: SplitModel = None

  def __init__(self): 
    """
    Initializes the Split class and creates an instance of SplitModel.

    """
    self.split_model = SplitModel(id=uuid4())
    print('Split initialized')

  def __str__(self) -> str:
    """
    Returns a string representation of the Split class.

    Returns:
      str: A string representation of the Split class.

    """
    return "Fancy Splitty Split Split" .  self.__class__.__name__
  
  @abstractmethod
  def aggregate_name(self, group):
    """
    Abstract method for getting the group name.

    Returns:
      str: The aggregated group name.

    """
    pass
  
  @abstractmethod
  def split(self, df):
    """
    Abstract method for splitting a DataFrame.

    Args:
      df (pd.DataFrame): The DataFrame to be split.

    """
    pass

class GroupBySplit(Split):
  by: list
  """
  A split operation based on grouping by columns.

  Attributes:
    by (list): A list of column names to group by.

  Methods:
    __init__(by): Initializes the GroupBySplit class.
    split(df): Splits the DataFrame by grouping it based on the specified columns.

  """

  def __init__(self, by):
    """
    Initializes the GroupBySplit class.

    Args:
      by (list): A list of column names to group by.

    """
    self.by = by
    super().__init__()
    self.split_model.type = 'group_by'
    self.split_model.description = 'Group by ' + ', '.join(by)

  def aggregate_name(self, group, aggregate: Aggregate):

    names = [ aggregate.get_column_by_name(col).display_name for col in self.by]
  
    return ' & '.join([str(names[idx]) + ": " + str(group[idx]) for idx, col in enumerate(self.by)])
  
  def split(self, df):
    """
    Splits the DataFrame by grouping it based on the specified columns.

    Args:
      df (pd.DataFrame): The DataFrame to be split.

    Returns:
      pd.DataFrameGroupBy: The grouped DataFrame.

    Raises:
      ValueError: If the specified columns are not found in the DataFrame.

    """
    if not set(self.by).issubset(df.columns):
      raise ValueError(f"Columns {self.by} not found in dataframe")
    return df.groupby(self.by, dropna=False, group_keys=True)

class FilterSplit(Split):
  """
  A split operation based on filtering.

  Methods:
    __init__(): Initializes the FilterSplit class.

  """

  def __init__(self, filter):
    """
    Initializes the FilterSplit class.

    """
    super().__init__()

class QueryFilterSplit(Split):
  """
  A split operation based on query filtering.

  Attributes:
    query (str): The query string.

  Methods:
    __init__(query): Initializes the QueryFilterSplit class.
    split(df): Splits the DataFrame based on the query.

  """

  def __init__(self, query):
    """
    Initializes the QueryFilterSplit class.

    Args:
      query (str): The query string.

    """
    self.query = query
    super().__init__()
  
  def split(self, df):
    """
    Splits the DataFrame based on the query.

    Args:
      df (pd.DataFrame): The DataFrame to be split.

    Returns:
      list: A list of tuples, where each tuple contains the query and the corresponding filtered DataFrame.

    """
    in_query = df.query(self.query)
    out_query = df.loc[df.index.difference(in_query.index)]
    return [(self.query, in_query), ("~("+str(self.query)+")", out_query)]

class Pm4pyFilterSplit(Split):
  """
  A split operation based on pm4py filtering.

  Methods:
    __init__(): Initializes the Pm4pyFilterSplit class.
    split(df_l, meta): Splits the DataFrame based on pm4py filtering.

  """

  def __init__(self):
    """
    Initializes the Pm4pyFilterSplit class.

    """
    super().__init__()

  def split(self, df_l, meta):
    """
    Splits the DataFrame based on pm4py filtering.

    Args:
      df_l: The DataFrame to be split.
      meta: The meta information.

    Returns:
      None

    """
    return None
  
class CutSplit(Split):
  """
  A split operation based on cutting a column into bins.

  Attributes:
    column (str): The column to be cut.
    bins (int): The number of bins.

  Methods:
    __init__(column, bins): Initializes the CutSplit class.
    split(df): Splits the DataFrame by cutting the specified column into bins.

  """

  def __init__(self, column, bins):
    """
    Initializes the CutSplit class.

    Args:
      column (str): The column to be cut.
      bins (int): The number of bins.

    """
    self.column = column
    self.bins = bins
    super().__init__()
    self.split_model.type = 'cut'
    self.split_model.description = 'Cut ' +  column + ' into ' + str(bins) + ' bins'

  def aggregate_name(self, group, aggregate: Aggregate):

    names = aggregate.get_column_by_name(self.column).display_name
  
    return str(names) + ": " + str(group)
  
  def split(self, df):
    """
    Splits the DataFrame by cutting the specified column into bins.

    Args:
      df (pd.DataFrame): The DataFrame to be split.

    Returns:
      pd.DataFrameGroupBy: The grouped DataFrame.

    """
    cut = pd.cut(df[self.column], bins=self.bins, include_lowest=True, right=True)
    return df.groupby(cut, dropna=False, group_keys=True)

class QCutSplit(Split): 
  """
  A split operation based on quantile cutting a column.

  Attributes:
    column (str): The column to be cut.
    q (int): The number of quantiles.

  Methods:
    __init__(column, q): Initializes the QCutSplit class.
    split(df): Splits the DataFrame by quantile cutting the specified column.

  """

  def __init__(self, column, q):
    """
    Initializes the QCutSplit class.

    Args:
      column (str): The column to be cut.
      q (int): The number of quantiles.

    """
    self.column = column
    self.q = q
    super().__init__()

  def split(self, df):
    """
    Splits the DataFrame by quantile cutting the specified column.

    Args:
      df (pd.DataFrame): The DataFrame to be split.

    Returns:
      pd.DataFrameGroupBy: The grouped DataFrame.

    """
    cut = pd.qcut(df[self.column], q=self.q, duplicates='drop')
    return df.groupby(cut, dropna=False, group_keys=True)