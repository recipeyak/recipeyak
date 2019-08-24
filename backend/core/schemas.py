from typing import List, Union

from pydantic import BaseModel
from typing_extensions import Literal


class SchedulepresenceSubscribe(BaseModel):
    event: Literal["schedule_presence"]
    team_id: int


class Subscribe(BaseModel):
    type: Literal["subscribe"]
    data: SchedulepresenceSubscribe


class PubSub(BaseModel):
    message: Subscribe
