
from pydantic import BaseModel,computed_field, ConfigDict
from typing import Optional
from uuid import UUID, uuid4

from models.column import Column

import cache.cache as cache

MAX_BINS_TO_HANDLE = 30
MAX_HEAD_ITEMS = 10

class AggregateColumn(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: UUID = uuid4()
    name: Optional[str] = None
    _order: Optional[int] = None
    _visible: Optional[bool] = None
    event_log_column: Optional[str] = None
    analysis_category:  Optional[str] = None
    split_type: Optional[str] = None
    has_nan_values: bool = False
    missing_values: int = 0
    distinct_values: int = 0
    fraction_of_distinct_values: float = 0.0
    recommended_conversion: str = None
    bin_sizes: int = 0
    treat_as: str = None
    head: Optional[list] = []
    value_dict: Optional[dict] = None
    stats: Optional[dict] = None

    @property
    def llm_string(self):
        return f"{self.name} ({self.display_name})"
    
    @property
    def representative_value(self):
      v = list(self.value_dict.values())
      k = list(self.value_dict.keys())
      return { 
         "value": k[v.index(max(v))], 
         "display_name": self.display_name,
         "event_log_column": self.event_log_column,
         "count": max(v), 
         "display_as": self.display_as, 
         "percentage": max(v)/sum(v) }
        
    @property
    def is_final(self):
        return self.distinct_values == 1

    @computed_field(return_type=str)
    @property 
    def column_type(self):
       return self.column.aggregate_column_type

    @computed_field(return_type=str)
    @property 
    def type(self):
       return self.column.type

    @computed_field(return_type=bool)
    @property 
    def visible(self):
       if self._visible is None:
          return self.column.visible
       return self._visible
    
    @visible.setter
    def visible(self, value):
       self._visible = value

    @computed_field(return_type=int)
    @property 
    def order(self):
       if self._order is None:
          return self.column.order
       return self._order
    
    @order.setter
    def order(self, value):
       self._order = value


    @computed_field(return_type=int)
    @property 
    def name_tech(self):
       return self.column.name_tech

    @computed_field(return_type=str)
    @property 
    def display_name(self):
       return self.column.display_name
    
    @computed_field(return_type=str)
    @property 
    def description(self):
       return self.column.description

    @property
    def column(self) -> Column:
       return cache.workspace.get_column_by_name(self.name)

    def init(self, cases, meta):
      df_meta_filtered = meta[meta.index == self.name][['mean', '25%', '50%', '75%', 'min', 'max']].dropna()
      if not df_meta_filtered.empty:
        stats = df_meta_filtered.iloc[0]
        stats = stats.map(self.mutate_values).to_dict()
      
        self.stats = {
          'mean': (stats['mean']),
            'q1': (stats['25%']),
            'median': (stats['50%']),
            'q3': (stats['75%']),
            'min': (stats['min']),
            'max': (stats['max']),
        }
      

      if self.name.startswith('bin||'):
         self.visible = False
         return
      
      if len(cases[self.name]) > MAX_HEAD_ITEMS:  
        self.head =  cases[self.name].sample(MAX_HEAD_ITEMS).map(self.mutate_values).tolist()
      else:
        self.head = cases[self.name].map(self.mutate_values).tolist()

      if self.distinct_values <= MAX_BINS_TO_HANDLE:
        self.value_dict = cases[self.name].map(self.mutate_values).value_counts().to_dict()

    @property
    def display_as(self):
      d = "text"
     
      if self.distinct_values < 10 or self.name in ('case:##len'):
        d = "badge"
      if self.type == 'timedelta':
         d = "duration"

      return d

    @computed_field(return_type=str)
    @property
    def column_head(self):         

      column = {
          'header': self.display_name,
          'field': str(self.name_tech),
          'align': 'start' if self.type == 'string' else 'end',
          'display_as': self.display_as,
          'rowHeader': (self.event_log_column == 'case_id')
      }
      return column
    
    def mutate_values(self, x): 
      if self.type == 'datetime':
        return str(x)
      elif self.type == 'timedelta':
        return int(x.total_seconds())
        #return strfdelta(x, truncate=True)
      elif self.type == 'boolean':
         return x
      else:
        return str(x)

from string import Formatter
from datetime import timedelta

def strfdelta(tdelta, fmt='{W:02} {D:02}d {H:02}h {M:02}m {S:02}s', truncate=False, inputtype='timedelta'):
    """Convert a datetime.timedelta object or a regular number to a custom-
    formatted string, just like the stftime() method does for datetime.datetime
    objects.

    The fmt argument allows custom formatting to be specified.  Fields can 
    include seconds, minutes, hours, days, and weeks.  Each field is optional.

    Some examples:
        '{D:02}d {H:02}h {M:02}m {S:02}s' --> '05d 08h 04m 02s' (default)
        '{W}w {D}d {H}:{M:02}:{S:02}'     --> '4w 5d 8:04:02'
        '{D:2}d {H:2}:{M:02}:{S:02}'      --> ' 5d  8:04:02'
        '{H}h {S}s'                       --> '72h 800s'

    The inputtype argument allows tdelta to be a regular number instead of the  
    default, which is a datetime.timedelta object.  Valid inputtype strings: 
        's', 'seconds', 
        'm', 'minutes', 
        'h', 'hours', 
        'd', 'days', 
        'w', 'weeks'
    """

    # Convert tdelta to integer seconds.
    if inputtype == 'timedelta':
        remainder = int(tdelta.total_seconds())
    elif inputtype in ['s', 'seconds']:
        remainder = int(tdelta)
    elif inputtype in ['m', 'minutes']:
        remainder = int(tdelta)*60
    elif inputtype in ['h', 'hours']:
        remainder = int(tdelta)*3600
    elif inputtype in ['d', 'days']:
        remainder = int(tdelta)*86400
    elif inputtype in ['w', 'weeks']:
        remainder = int(tdelta)*604800

    f = Formatter()
    desired_fields = [field_tuple[1] for field_tuple in f.parse(fmt)]
    possible_fields = ('W', 'D', 'H', 'M', 'S')
    constants = {'W': 604800, 'D': 86400, 'H': 3600, 'M': 60, 'S': 1}
    values = {}
    for field in possible_fields:
        if field in desired_fields and field in constants:
            values[field], remainder = divmod(remainder, constants[field])
    if not truncate:
      return f.format(fmt, **values)
    
    fmt = ""
    add_rest = False
    if values['W'] > 0:
        fmt =  fmt + ('{W}w ')
        add_rest = True
    if values['D'] > 0 or add_rest:
        fmt =  fmt + ('{D}d ')
    fmt= fmt + "{H:2}:{M:02}:{S:02}"
    time = f.format(fmt, **values)
    return time