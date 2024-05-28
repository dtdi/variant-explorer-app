from pydantic import BaseModel, Field


class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_variants: int = 0
    fraction_total_cases: float = 0
    fraction_total_events: float = 0
    mean_duration: float = 0
    median_duration: float = 0
    min_duration: float = 0
    max_duration: float = 0
    std_duration: float = 0
    mean_events_per_case: float = 0
    median_events_per_case: float = 0
    min_events_per_case: float = 0
    max_events_per_case: float = 0
    std_events_per_case: float = 0
    