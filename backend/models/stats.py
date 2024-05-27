from pydantic import BaseModel, Field


class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_variants: int = 0
    fraction_total_cases: float = 0
    fraction_total_events: float = 0