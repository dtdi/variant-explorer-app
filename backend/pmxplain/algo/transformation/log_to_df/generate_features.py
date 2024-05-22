
from typing import Any, Optional, Dict

import pandas as pd
from pm4py.util import constants
from pm4py.util import exec_utils
from pm4py.objects.log.util.dataframe_utils import Parameters
from pm4py.objects.conversion.log import converter as log_converter
from pm4py.statistics.traces.generic.pandas import case_statistics


def dataframe_to_activity_case_table(df: pd.DataFrame, parameters: Optional[Dict[Any, Any]] = None):
    """
    Transforms a Pandas dataframe into:
    - an "activity" table, containing the events and their attributes
    - a "case" table, containing the cases and their attributes

    Parameters
    --------------
    df
        Dataframe
    parameters
        Parameters of the algorithm that should be used, including:
        - Parameters.CASE_ID_KEY => the column to be used as case ID (shall be included both in the activity table and the case table)
        - Parameters.CASE_PREFIX => if a list of attributes at the case level is not provided, then all the ones of the dataframe
                                    starting with one of these are considered.
        - Parameters.CASE_ATTRIBUTES => the attributes of the dataframe to be used as case columns

    Returns
    ---------------
    activity_table
        Activity table
    case_table
        Case table
    """
    if parameters is None:
        parameters = {}

    # make sure we start from a dataframe object
    df = log_converter.apply(df, variant=log_converter.Variants.TO_DATA_FRAME, parameters=parameters)

    case_id_key = exec_utils.get_param_value(Parameters.CASE_ID_KEY, parameters, constants.CASE_CONCEPT_NAME)
    case_id_prefix = exec_utils.get_param_value(Parameters.CASE_PREFIX, parameters, constants.CASE_ATTRIBUTE_PREFIX)

    case_attributes = exec_utils.get_param_value(Parameters.CASE_ATTRIBUTES, parameters, set([x for x in df.columns if x.startswith(case_id_prefix)]))
    event_attributes = set([x for x in df.columns if x not in case_attributes])

    print("case_attributes", case_attributes)
    print("event_attributes", event_attributes)


    activity_table = df[list(event_attributes.union({case_id_key}))]
    case_table = df[list(case_attributes.union({case_id_key}))].groupby(case_id_key).first().reset_index()
    case_table.set_index('case:concept:name', inplace=True, drop=False)
    return activity_table, case_table


def get_variants(df_l):
  variants_df = case_statistics.get_variants_df(df_l)
  variants_df['##variant_str'] = variants_df['variant'].map( lambda x: " -> ".join(x) )
  variants_df['##len'] = variants_df['variant'].map( lambda x: len(x) )
  variants_df['##variant'] = variants_df['variant']
  variants_df = variants_df.drop(columns=['variant'])
  return variants_df

def _generate_features(df_l):
  df_act, df_case = dataframe_to_activity_case_table(df_l)

  variants_df = get_variants(df_l)
  durations_df = pd.DataFrame.from_dict(case_statistics.get_cases_description(df_l))
  df_joined = df_case.join(variants_df).join(durations_df.T)

  # Assuming df_joined is the DataFrame containing the "startTime" and "endTime" columns
  df_joined['@@startTime'] = pd.to_datetime(df_joined['startTime'], unit='s')
  df_joined['@@endTime'] = pd.to_datetime(df_joined['endTime'], unit='s')
  df_joined['@@caseDuration'] = pd.to_timedelta(df_joined['caseDuration'], unit='s')
  df_joined.drop(columns=['startTime','endTime', 'caseDuration'], inplace=True)
  df_joined.columns = ['case:' + col if not col.startswith('case:') else col for col in df_joined.columns]

  return df_joined,df_act

def apply(event_log: pd.DataFrame):
  cases, activites = _generate_features(event_log)
  
  return cases, activites