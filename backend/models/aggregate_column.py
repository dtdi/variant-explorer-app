
from pydantic import BaseModel,computed_field
from typing import Optional
from uuid import UUID, uuid4

from models.column import Column

import cache.cache as cache

MAX_BINS_TO_HANDLE = 30

class AggregateColumn(BaseModel):
    id: UUID = uuid4()
    name: Optional[str] = None
    _order: int = 0
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

    @property
    def llm_string(self):
        return f"{self.name} ({self.display_name})"
  
    @computed_field(return_type=str)
    @property 
    def column_type(self):
       return self.column.aggregate_column_type

    @computed_field(return_type=str)
    @property 
    def type(self):
       return self.column.type


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

    def init(self, cases):
      if len(cases[self.name]) > 10:  
        self.head =  cases[self.name].sample(10).map(self.mutate_values).tolist()
      else:
        self.head = cases[self.name].map(self.mutate_values).tolist()

      if self.distinct_values <= MAX_BINS_TO_HANDLE:
        self.value_dict = cases[self.name].map(self.mutate_values).value_counts().to_dict()

    @computed_field(return_type=str)
    @property
    def column_head(self):

      display_as = "badge" if self.distinct_values < 10 or self.name in ('case:##len') else "text"

      column = {
          'header': self.display_name,
          'field': str(self.name_tech),
          'align': 'start' if self.type == 'string' else 'end',
          'display_as': display_as,
          'rowHeader': (self.event_log_column == 'case_id')
      }
      return column
    
    def mutate_values(self, x): 
      if self.type == 'datetime':
        return str(x)
      elif self.type == 'timedelta':
        return strfdelta(x, '{D:02}d {H}:{M:02}:{S:02}')
      else:
        return x

from string import Formatter
from datetime import timedelta

def strfdelta(tdelta, fmt='{D:02}d {H:02}h {M:02}m {S:02}s', inputtype='timedelta'):
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
    return f.format(fmt, **values)