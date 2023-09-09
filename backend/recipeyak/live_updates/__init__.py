from ably import AblyRest as _AblyRest

from recipeyak.config import ABLY_API_KEY

AblyRest = _AblyRest(ABLY_API_KEY)
