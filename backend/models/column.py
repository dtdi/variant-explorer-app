
from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4

MAX_BINS_TO_HANDLE = 30

class Column(BaseModel):
    id: UUID = uuid4()
    order: int = 9999
    visible: bool = True
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
            self.display_name = 'Case ID'
            self.description = 'The unique identifier of the case'
            self.order = 0
        if self.name == 'case:@@caseDuration':
            self.order = 2
            self.event_log_column = 'duration'
            self.display_name = 'Duration'
            self.description = 'The duration of the case'
        if self.name == 'case:@@startTime':
            self.order = 1
            self.event_log_column = 'start_time'
            self.display_name = 'Start Time'
            self.description = 'The start time of the case'
        if self.name == 'case:@@endTime':
            self.event_log_column = 'end_time'
            self.display_name = 'End Time'
            self.description = 'The end time of the case'
        if self.name == 'case:@@service_time':
            self.event_log_column = 'service_time'
            self.display_name = 'Service Time'
            self.description = 'The service time of the case'
        if self.name == 'case:@@waiting_time':
            self.event_log_column = 'waiting_time'
            self.display_name = 'Waiting Time'
            self.description = 'The waiting time of the case'
        if self.name == 'case:@@sojourn_time':
            self.event_log_column = 'sojourn_time'
            self.display_name = 'Sojourn Time'
            self.description = 'The sojourn time of the case'
        if self.name == 'case:##len':
            self.event_log_column = 'length'
            self.display_name = 'Length'
            self.description = 'The number of events in the case'
            self.order = 3
        if self.name == 'case:##variant_str':
            self.event_log_column = 'variant'
            self.display_name = 'Variant'
        if self.name == 'case:@@arrival_rate':
            self.event_log_column = 'arrival_rate'
            self.display_name = 'Arrival Rate'
        if self.name == 'case:@@diff_start_end':
            self.event_log_column = 'diff_start_end'
        if self.name.startswith('bin||'):
            self.visible = False

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
