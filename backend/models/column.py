
from pydantic import BaseModel
from typing import Union
from uuid import UUID, uuid4
from datetime import datetime
from pathlib import Path
import shutil
import os

class Column(BaseModel):
    id: UUID = uuid4()
    name: str
    name_tech: int = 0
    display_name: str
    description: str
    type: str = None
    event_log_column: Union[None,str] = None
    analysis_category:  Union[None,str] = None
    aggregate_column_type:  Union[None,str] = None

    def init(self):
        self.infer_aggregate_column_type()
        if self.name is 'case:concept:name':
            self.event_log_column = 'case:concept:name'
        

    def infer_aggregate_column_type(self):
        if self.type == "bool":
            self.aggregate_column_type = BoolColumn
        elif self.type == "string":
            self.aggregate_column_type = StringColumn
        elif self.type == "numeric":
            self.aggregate_column_type = NumericColum
        elif self.type == "datetime":
            self.aggregate_column_type = DateTimeColumn
        elif self.type == "categorical":
            self.aggregate_column_type = CategoricalColumn
        elif self.type == "period":
            self.aggregate_column_type = PeriodColumn
        elif self.type == "timedelta":
            self.aggregate_column_type = TimedeltaColumn
        elif self.type == "interval":
            self.aggregate_column_type = IntervalColumn
        else:
            self.aggregate_column_type = AggregateColumn
        
        self.aggregate_column_type = str((self.aggregate_column_type.__class__.__name__))
        


class AggregateColumn(Column):
    has_nan_values: bool = False
    missing_values: int = 0
    distinct_values: int = 0
    fraction_of_distinct_values: float = 0.0
    recommended_conversion: str = None
    bin_sizes: int = 0
    treat_as: str = None

class StringColumn(AggregateColumn):
    pass

class BoolColumn(AggregateColumn):
    pass

class NumericColum(AggregateColumn):
    pass

class DateTimeColumn(AggregateColumn):
    pass

class CategoricalColumn(AggregateColumn):
    pass

class PeriodColumn(AggregateColumn):
    pass

class TimedeltaColumn(AggregateColumn):
    pass

class IntervalColumn(AggregateColumn):
    pass