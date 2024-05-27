import pandas as pd
from pm4py.objects.log.obj import EventLog, EventStream, Trace
from typing import Union, Optional, Dict, Tuple, List, Any
from pm4py.utils import get_properties, constants, check_is_pandas_dataframe
from pm4py.utils import __event_log_deprecation_warning
from pm4py.objects.ocel.obj import OCEL
from sqlite3 import Connection as SQ3_Connection
from tempfile import NamedTemporaryFile
from copy import copy
from pm4py.objects.petri_net.obj import PetriNet, Marking

def abstract_log_features(log_obj: Union[pd.DataFrame, EventLog, EventStream], max_len: int = constants.OPENAI_MAX_LEN, include_header: bool = True, activity_key: str = "concept:name", timestamp_key: str = "time:timestamp", case_id_key: str = "case:concept:name") -> str:
    """
    Abstracts the machine learning features obtained from a log (reporting the top features until the desired length is obtained)

    :param log_obj: log object
    :param max_len: maximum length of the (string) abstraction
    :param activity_key: the column to be used as activity
    :param timestamp_key: the column to be used as timestamp
    :param case_id_key: the column to be used as case identifier
    :rtype: ``str``

    .. code-block:: python3

        import pm4py

        log = pm4py.read_xes("tests/input_data/roadtraffic100traces.xes")
        print(pm4py.llm.abstract_log_features(log))
    """
    __event_log_deprecation_warning(log_obj)

    parameters = get_properties(
        log_obj, activity_key=activity_key, timestamp_key=timestamp_key, case_id_key=case_id_key)
    parameters["max_len"] = max_len
    parameters["include_header"] = include_header

    from pmxplain.algo.querying.llm.abstractions import aggregate_to_descr
    return aggregate_to_descr.apply(log_obj, parameters=parameters)


