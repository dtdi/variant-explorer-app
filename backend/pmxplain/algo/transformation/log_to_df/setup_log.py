
from enum import Enum
from typing import Any, Optional, Dict, Union, List, Tuple

import pandas as pd
import numpy as np
import stringcase
import pm4py
import pandas as pd
import datetime as dt
from pm4py.objects.log.obj import EventLog, EventStream
from pm4py.util import exec_utils
from pmxplain.algo.transformation.log_to_df.variants import trace_based


from typing import Any, Optional, Dict

import pandas as pd
from pm4py.util import constants
from pm4py.util import exec_utils
from pm4py.objects.log.util.dataframe_utils import Parameters
from pm4py.objects.conversion.log import converter as log_converter
from pmxplain.algo.transformation.log_to_df import algorithm
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
    case_table.set_index('case:concept:name', inplace=True)
    return activity_table, case_table


def get_variants(df_l):
  variants_df = case_statistics.get_variants_df(df_l)
  variants_df['##variant_str'] = variants_df['variant'].map( lambda x: " -> ".join(x) )
  variants_df['##len'] = variants_df['variant'].map( lambda x: len(x) )
  variants_df['##variant'] = variants_df['variant']
  variants_df = variants_df.drop(columns=['variant'])
  return variants_df

def make_the_dfs(df_l):
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


def get_data_category(series):
    if pd.api.types.is_numeric_dtype(series.dtype):
        return 'numeric'
    elif isinstance(series.dtype, pd.CategoricalDtype):
        return 'categorical'
    elif pd.api.types.is_datetime64_any_dtype(series.dtype):
        return 'datetime'
    elif pd.api.types.is_bool_dtype(series.dtype):
        return 'boolean'
    elif isinstance(series.dtype, pd.PeriodDtype):
        return 'period'
    elif pd.api.types.is_timedelta64_dtype(series.dtype):
        return 'timedelta'
    elif isinstance(series.dtype, pd.IntervalDtype):
        return 'interval'
    elif pd.api.types.is_string_dtype(series.dtype):
        return 'string'
    else:
        return 'other'
  
BIN_TRESHOLD = 0.1
MAX_BINS = 30
# takes the dataframe description and the original dataframe and 
# recommends whether the individual columns must be 
# converted into categorical values for further use
def recommend_binning(df_meta, df):
    bin_it = []
    bin_sizes = []

    for _, row in df_meta.iterrows():
        # Get the fraction of distinct values for the current column
        fraction = row['fraction_of_distinct_values']
        distinct = row['distinct_values']
        # If the fraction of distinct values is less than a certain threshold (e.g., 0.1), 
        # recommend converting the column into categorical values
        if (distinct > 30 or fraction > BIN_TRESHOLD) and row['category'] in ('numeric', 'timedelta', 'datetime'):
            df_meta.at[row.name, 'recommended_conversion'] = 'binning_needed'

              #  Recommend bin size as the square root of the number of distinct values
            bin_sizes.append(int( min(np.sqrt(df[row.name].nunique()), MAX_BINS)))
        else:
            bin_sizes.append(0)

    df_meta['bin_sizes'] = bin_sizes
    return df_meta

def apply_bin_to_column(df, row):
    name = 'bin||'+row.name
    df[name] = pd.cut(df[row.name], row['bin_sizes'],right=True,include_lowest=True,duplicates='drop')
    return name

def add_recommended_bin_columns(df_meta, df):
    new_columns = []
    for _, row in df_meta.iterrows():        
        if row['recommended_conversion'] == 'binning_needed' and row['treat_as'] == ('feature'):
          name = apply_bin_to_column(df, row) 
          df_meta.at[row.name, 'treat_as'] = name
          new_columns.append( name )

    if len(new_columns) > 0:
      added_df = _describe_dataframe(df[new_columns])
      df_meta.update(added_df)
    return df_meta


def convert_to_nice_string(name):
    return stringcase.titlecase(name)
    
def recommend_conversion(df_description):
    recommended_conversion = []
    for _, row in df_description.iterrows():
        if row['category'] == 'numeric' and row['has_nan_values']:
            recommended_conversion.append('fill_nan_with_mean_convert_to_int64')
        elif row['category'] == 'numeric' and not row['has_nan_values']:
            recommended_conversion.append('convert_to_int64')
        else:
            recommended_conversion.append('no_conversion_needed')
    df_description['recommended_conversion'] = recommended_conversion
    return df_description

def recommend_treat_as(df_description):
    treat_as = []
    for _, row in df_description.iterrows():
        if row['category'] == 'numeric' and row['has_nan_values']:
            treat_as.append('fill_nan_with_mean_convert_to_int64')
        elif row['category'] == 'numeric' and not row['has_nan_values']:
            treat_as.append('convert_to_int64')
        else:
            treat_as.append('feature')
    df_description['treat_as'] = treat_as
    return df_description

def _describe_dataframe(df):
    description = pd.DataFrame({
        'name': [convert_to_nice_string(col) for col in df.columns],
        'column': df.columns,
        'dtype': df.dtypes.values,
        'category': [get_data_category(df[col]) for col in df.columns],
        'has_nan_values': [(df[col]).isnull().any() for col in df.columns],
        'distinct_values': [df[col].nunique() for col in df.columns],
        'fraction_of_distinct_values': [df[col].nunique() / df[col].count() for col in df.columns],
        'missing_values': [df[col].isnull().sum() for col in df.columns],
        'recommended_conversion': 'no_conversion_needed',
        'bin_sizes': 0,
        'treat_as': 'feature',
    })
    description.set_index('column', inplace=True)
    description = description.join((df.describe()).T)
    description = recommend_conversion(description)
    description = recommend_binning(description, df)
    description = recommend_treat_as(description)
    description = add_recommended_bin_columns(description, df)
   
    return description


def apply(df_l: pd.DataFrame):
  df_l = pm4py.insert_case_arrival_finish_rate(df_l)
  df_l = pm4py.insert_case_service_waiting_time(df_l)

  # Convert columns starting with '@@' to timedelta
  for col in df_l.columns:
      if col.startswith('@@'):
          df_l['case:'+col] = pd.to_timedelta(df_l[col], unit='s')
          df_l = df_l.drop(columns=[col])

  df_joined, df_act = make_the_dfs(df_l)
  try:
    df_meta = _describe_dataframe(df_joined)
  except Exception as err: 
      print(err)
  return df_joined, df_act, df_l, df_meta