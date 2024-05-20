from pydantic import BaseModel, Field


class Stats(BaseModel):
    number_cases: int = 0
    number_events: int = 0
    number_variants: int = 0