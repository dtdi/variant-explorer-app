from enum import Enum
from typing import Optional, Dict, Any, Union, Tuple, List, Set

import pandas as pd

from pm4py.objects.conversion.log import converter
from pm4py.objects.log.obj import EventLog, Trace, Event
from pm4py.objects.log.util import dataframe_utils
from pm4py.util import constants
from pm4py.util import exec_utils
from pm4py.util import xes_constants as xes
from pm4py.util import xes_constants
from pm4py.algo.transformation.log_to_features.variants.trace_based import case_duration, get_all_string_event_attribute_values, get_all_string_trace_attribute_values, get_numeric_trace_attribute_rep, get_numeric_event_attribute_rep, get_all_string_event_succession_attribute_values, get_string_trace_attribute_rep, get_numeric_trace_attribute_value, get_values_event_attribute_for_trace, get_numeric_event_attribute_value_trace, get_values_event_attribute_succession_for_trace
from pm4py.statistics.attributes.log.get import get_attribute_values, get_all_event_attributes_from_log, get_all_trace_attributes_from_log, get_trace_attribute_values



class Parameters(Enum):
    ENABLE_ACTIVITY_DEF_REPRESENTATION = "enable_activity_def_representation"
    ENABLE_SUCC_DEF_REPRESENTATION = "enable_succ_def_representation"
    STR_TRACE_ATTRIBUTES = "str_tr_attr"
    STR_EVENT_ATTRIBUTES = "str_ev_attr"
    NUM_TRACE_ATTRIBUTES = "num_tr_attr"
    NUM_EVENT_ATTRIBUTES = "num_ev_attr"
    STR_EVSUCC_ATTRIBUTES = "str_evsucc_attr"
    FEATURE_NAMES = "feature_names"
    ACTIVITY_KEY = constants.PARAMETER_CONSTANT_ACTIVITY_KEY
    START_TIMESTAMP_KEY = constants.PARAMETER_CONSTANT_START_TIMESTAMP_KEY
    TIMESTAMP_KEY = constants.PARAMETER_CONSTANT_TIMESTAMP_KEY
    CASE_ID_KEY = constants.PARAMETER_CONSTANT_CASEID_KEY
    RESOURCE_KEY = constants.PARAMETER_CONSTANT_RESOURCE_KEY
    EPSILON = "epsilon"
    DEFAULT_NOT_PRESENT = "default_not_present"
    ENABLE_ALL_EXTRA_FEATURES = "enable_all_extra_features"
    ENABLE_CASE_DURATION = "enable_case_duration"
    ADD_CASE_IDENTIFIER_COLUMN = "add_case_identifier_column"
    ENABLE_TIMES_FROM_FIRST_OCCURRENCE = "enable_times_from_first_occurrence"
    ENABLE_TIMES_FROM_LAST_OCCURRENCE = "enable_times_from_last_occurrence"
    ENABLE_DIRECT_PATHS_TIMES_LAST_OCC = "enable_direct_paths_times_last_occ"
    ENABLE_INDIRECT_PATHS_TIMES_LAST_OCC = "enable_indirect_paths_times_last_occ"
    ENABLE_WORK_IN_PROGRESS = "enable_work_in_progress"
    ENABLE_RESOURCE_WORKLOAD = "enable_resource_workload"
    ENABLE_FIRST_LAST_ACTIVITY_INDEX = "enable_first_last_activity_index"
    ENABLE_MAX_CONCURRENT_EVENTS = "enable_max_concurrent_events"
    ENABLE_MAX_CONCURRENT_EVENTS_PER_ACTIVITY = "enable_max_concurrent_events_per_activity"
    CASE_ATTRIBUTE_PREFIX = constants.CASE_ATTRIBUTE_PREFIX

DEFAULT_MAX_CASES_FOR_ATTR_SELECTION = 50

def get_trace_attribute_value(trace: Trace, trace_attribute: str) -> Union[int, float, str]:
    """
    Get the value of a numeric trace attribute from a given trace

    Parameters
    ------------
    trace
        Trace of the log

    Returns
    ------------
    value
        Value of the numeric trace attribute for the given trace
    """
    if trace_attribute in trace.attributes:
        return trace.attributes[trace_attribute]
    raise Exception("at least a trace without trace attribute: " + trace_attribute)

def get_event_attribute_value(event: Event, event_attribute: str) -> Union[int, float,str]:
    """
    Get the value of a numeric event attribute from a given event

    Parameters
    -------------
    event
        Event

    Returns
    -------------
    value
        Value of the numeric event attribute for the given event
    """
    if event_attribute in event:
        return event[event_attribute]
    return None

def get_event_attribute_value_trace(trace: Trace, event_attribute: str) -> Union[int, float, str]:
    """
    Get the value of the last occurrence of a numeric event attribute given a trace

    Parameters
    -------------
    trace
        Trace of the log

    Returns
    -------------
    value
        Value of the last occurrence of a numeric trace attribute for the given trace
    """
    non_zero_values = []
    for event in trace:
        value = get_event_attribute_value(event, event_attribute)
        if value is not None:
            non_zero_values.append(value)
    if len(non_zero_values) > 0:
        return non_zero_values[-1]
    raise Exception("at least a trace without any event with event attribute: " + event_attribute)

def get_default_representation(log: EventLog, parameters: Optional[Dict[Union[str, Parameters], Any]] = None,
                               feature_names: Optional[List[str]] = None) -> Tuple[Any, List[str]]:
    """
    Gets the default data representation of an event log (for process tree building)

    Parameters
    -------------
    log
        Trace log
    parameters
        Possible parameters of the algorithm
    feature_names
        (If provided) Feature to use in the representation of the log

    Returns
    -------------
    data
        Data to provide for decision tree learning
    feature_names
        Names of the features, in order
    """
    if parameters is None:
        parameters = {}

    activity_key = parameters[
        constants.PARAMETER_CONSTANT_ACTIVITY_KEY] if constants.PARAMETER_CONSTANT_ACTIVITY_KEY in parameters else xes.DEFAULT_NAME_KEY

    event_attributes = get_all_event_attributes_from_log(log)
    trace_attributes = get_all_trace_attributes_from_log(log)

    event_attributes.add(activity_key)
  
    return get_representation(log, trace_attributes, event_attributes, 
                              feature_names=feature_names)


def get_representation(log: EventLog, trace_attributes: List[str], event_attributes: List[str],
                       feature_names: Optional[List[str]] = None) -> Tuple[Any, List[str]]:
    data = []
    dictionary = {}
    feature_names = []

    count = 0
    for trace_attribute in trace_attributes:
      dictionary[trace_attribute] = count
      feature_names.append(trace_attribute)
      count = count + 1
    # for event_attribute in event_attributes:
    #   dictionary[event_attribute] = count
    #   feature_names.append(event_attribute)
    #   count = count + 1

    for trace in log:
        trace_rep = [0] * count
        
        for trace_attribute in trace_attributes:
            this_value = (trace_attribute)
            if this_value in dictionary:
                trace_rep[dictionary[this_value]] = get_trace_attribute_value(
                    trace, trace_attribute)
                
        # for event_attribute in event_attributes:
        #     this_value = (event_attribute)
        #     if this_value in dictionary:
        #         trace_rep[dictionary[this_value]] = get_numeric_event_attribute_value_trace(
        #             trace, event_attribute)
   
        data.append(trace_rep)
    # data = np.asarray(data)
    return data, feature_names


def apply(log: EventLog, parameters: Optional[Dict[Union[str, Parameters], Any]] = None) -> Tuple[Any, List[str]]:
    """
    Extract the features from an event log (a vector for each trace)

    Parameters
    -----------------
    log
        Log
    parameters
        Parameters of the algorithm, including:
        - STR_TRACE_ATTRIBUTES => string trace attributes to consider in the features extraction
        - STR_EVENT_ATTRIBUTES => string event attributes to consider in the features extraction
        - NUM_TRACE_ATTRIBUTES => numeric trace attributes to consider in the features extraction
        - NUM_EVENT_ATTRIBUTES => numeric event attributes to consider in the features extraction
        - STR_EVSUCC_ATTRIBUTES => succession of event attributes to consider in the features extraction
        - FEATURE_NAMES => features to consider (in the given order)
        - ENABLE_ALL_EXTRA_FEATURES => enables all the extra features
        - ENABLE_CASE_DURATION => enables the case duration as additional feature
        - ENABLE_TIMES_FROM_FIRST_OCCURRENCE => enables the addition of the times from start of the case, to the end
        of the case, from the first occurrence of an activity of a case
        - ADD_CASE_IDENTIFIER_COLUMN => adds the case identifier (string) as column of the feature table (default: False)
        - ENABLE_TIMES_FROM_LAST_OCCURRENCE => enables the addition of the times from start of the case, to the end
        of the case, from the last occurrence of an activity of a case
        - ENABLE_DIRECT_PATHS_TIMES_LAST_OCC => add the duration of the last occurrence of a directed (i, i+1) path
        in the case as feature
        - ENABLE_INDIRECT_PATHS_TIMES_LAST_OCC => add the duration of the last occurrence of an indirect (i, j) path
        in the case as feature
        - ENABLE_WORK_IN_PROGRESS => enables the work in progress (number of concurrent cases) as a feature
        - ENABLE_RESOURCE_WORKLOAD => enables the resource workload as a feature
        - ENABLE_FIRST_LAST_ACTIVITY_INDEX => enables the insertion of the indexes of the activities as features
        - ENABLE_MAX_CONCURRENT_EVENTS => enables the count of the number of concurrent events inside a case
        - ENABLE_MAX_CONCURRENT_EVENTS_PER_ACTIVITY => enables the count of the number of concurrent events per activity

    Returns
    -------------
    data
        Data to provide for decision tree learning
    feature_names
        Names of the features, in order
    """
    if parameters is None:
        parameters = {}

    str_tr_attr = exec_utils.get_param_value(Parameters.STR_TRACE_ATTRIBUTES, parameters, None)
    num_tr_attr = exec_utils.get_param_value(Parameters.NUM_TRACE_ATTRIBUTES, parameters, None)
    str_ev_attr = exec_utils.get_param_value(Parameters.STR_EVENT_ATTRIBUTES, parameters, None)
    num_ev_attr = exec_utils.get_param_value(Parameters.NUM_EVENT_ATTRIBUTES, parameters, None)
    str_evsucc_attr = exec_utils.get_param_value(Parameters.STR_EVSUCC_ATTRIBUTES, parameters, None)
    feature_names = exec_utils.get_param_value(Parameters.FEATURE_NAMES, parameters, None)

    at_least_one_provided = (str_tr_attr is not None) or (num_tr_attr is not None) or (str_ev_attr is not None) or (num_ev_attr is not None)

    if str_tr_attr is None:
        str_tr_attr = []

    if num_tr_attr is None:
        num_tr_attr = []

    if str_ev_attr is None:
        str_ev_attr = []

    if num_ev_attr is None:
        num_ev_attr = []


    enable_all = exec_utils.get_param_value(Parameters.ENABLE_ALL_EXTRA_FEATURES, parameters, False)
    case_id_key = exec_utils.get_param_value(Parameters.CASE_ID_KEY, parameters, xes_constants.DEFAULT_TRACEID_KEY)
    add_case_identifier_column = exec_utils.get_param_value(Parameters.ADD_CASE_IDENTIFIER_COLUMN, parameters, False)
    enable_case_duration = exec_utils.get_param_value(Parameters.ENABLE_CASE_DURATION, parameters, enable_all)
    
    log = converter.apply(log, variant=converter.Variants.TO_EVENT_LOG, parameters=parameters)
    if at_least_one_provided:
        datas, features_namess = get_representation(log, str_tr_attr, str_ev_attr, num_tr_attr, num_ev_attr,
                                  str_evsucc_attr=str_evsucc_attr, feature_names=feature_names)
    else:
        datas, features_namess = get_default_representation(log, parameters=parameters)

    if add_case_identifier_column:
        for i in range(len(datas)):
            datas[i] = [log[i].attributes[case_id_key]] + datas[i]
        features_namess = ["@@case_id_column"] + features_namess

    # add additional features

    if enable_case_duration:
        data, features_names = case_duration(log, parameters=parameters)
        for i in range(len(datas)):
            datas[i] = datas[i] + data[i]
        features_namess = features_namess + features_names

    return datas, features_namess
