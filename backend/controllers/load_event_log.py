from collections import Counter
from typing import Mapping, Tuple

from pmxplain.utils.timestamp_utils import TimeUnit


from pm4py.objects.log.obj import EventLog, Trace
from pm4py.objects.log.util.interval_lifecycle import to_interval
from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY

from api.routes.variants.variants import VariantInformation
from util.multiprocessing.pool_factory import PoolFactory
from controllers.alignments import InfixType



def calculate_event_log_properties(
        event_log: EventLog, time_granularity: TimeUnit = None, use_mp: bool = False
):
    if time_granularity is None:
        time_granularity = min(TimeUnit)

    res = {

        "timeGranularity": time_granularity,
    }
    # pickle.dump(cache.variants,  open( "./resources/variants.p", "wb" ))
    # pickle.dump(cache.parameters,  open( "./resources/parameters.p", "wb" ))

    return res


def create_variant_object(time_granularity, total_traces, bid, v, ts, info: VariantInformation):

    variant = {
        "count": len(ts),
        "variant": v.serialize(),
        "bid": bid,
        "length": len(v),
        "number_of_activities": v.number_of_activities(),
        "percentage": round(len(ts) / total_traces * 100, 2),
        "userDefined": info.is_user_defined,
        "infixType": info.infix_type.value
    }

    # If the variant is only a single activity leaf, wrap it up as a sequence
    if "leaf" in variant["variant"].keys() or "parallel" in variant["variant"].keys():
        variant["variant"] = {"follows": [variant["variant"]]}

    return variant