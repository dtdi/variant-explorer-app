import pandas as pd
from abc import ABC, abstractmethod
class Split(ABC):
    def __init__(self): 
        print('Split initialized')

    def __str__(self) -> str:
        return "Fancy Splitty Split Split" .  self.__class__.__name__
    
    @abstractmethod
    def split(self, df):
        pass

class GroupBySplit(Split):
    def __init__(self, by):
        self.by = by
        super().__init__()
    
    def split(self, df):
        if not set(self.by).issubset(df.columns):
          raise ValueError(f"Columns {self.by} not found in dataframe")
        return df.groupby(self.by, dropna=False, group_keys=True)

class FilterSplit(Split):
  def __init__(self, filter):
        super().__init__()

class QueryFilterSplit(Split):
    def __init__(self, query):
        self.query = query
        super().__init__()
    
    def split(self, df):
        in_query = df.query(self.query)
        out_query = df.loc[ df.index.difference(in_query.index) ]
        return [(self.query, in_query), ("~("+str(self.query)+")", out_query)]

class Pm4pyFilterSplit(Split):
    def __init__(self):
      super().__init__()

    def split(self, df_l, meta):
        return None
    
class CutSplit(Split):
    def __init__(self, column, bins):
        self.column = column
        self.bins = bins
        super().__init__()
    
    def split(self, df):
      cut = pd.cut(df[self.column], bins=self.bins, include_lowest=True, right=True)
      return df.groupby(cut, dropna=False, group_keys=True)

class QCutSplit(Split): 
    def __init__(self, column, q):
        self.column = column
        self.q = q
        super().__init__()

    def split(self, df):
      cut = pd.qcut(df[self.column], q=self.q, duplicates='drop')
      return df.groupby(cut, dropna=False, group_keys=True,)