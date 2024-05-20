
from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4

MAX_BINS_TO_HANDLE = 30

class Column(BaseModel):
    id: UUID = uuid4()
    order: int = 0
    name: str
    name_tech: int = 0
    display_name: str
    description: str
    type: str = None
    event_log_column: Optional[str] = None
    analysis_category:  Optional[str] = None
    aggregate_column_type:  Optional[str] = None

    def init(self):
        self.infer_aggregate_column_type()
        if self.name == 'case:concept:name':
            self.event_log_column = 'case_id'
        if self.name == 'case:@@caseDuration':
            self.event_log_column = 'duration'
        if self.name == 'case:@@startTime':
            self.event_log_column = 'start_time'
        if self.name == 'case:@@endTime':
            self.event_log_column = 'end_time'
        if self.name == 'case:@@service_time':
            self.event_log_column = 'service_time'
        if self.name == 'case:@@waiting_time':
            self.event_log_column = 'waiting_time'
        if self.name == 'case:@@sojourn_time':
            self.event_log_column = 'sojourn_time'
        if self.name == 'case:##len':
            self.event_log_column = 'length'
        if self.name == 'case:##variant_str':
            self.event_log_column = 'variant'

    def infer_aggregate_column_type(self):
        if self.type == "bool":
            self.aggregate_column_type = "BoolColumn"
        elif self.type == "string":
            self.aggregate_column_type = "StringColumn"
        elif self.type == "numeric":
            self.aggregate_column_type = "NumericColum"
        elif self.type == "datetime":
            self.aggregate_column_type = "DateTimeColumn"
        elif self.type == "categorical":
            self.aggregate_column_type = "CategoricalColumn"
        elif self.type == "period":
            self.aggregate_column_type = "PeriodColumn"
        elif self.type == "timedelta":
            self.aggregate_column_type = "TimedeltaColumn"
        elif self.type == "interval":
            self.aggregate_column_type = "IntervalColumn"
        else:
            self.aggregate_column_type = "AggregateColumn"
