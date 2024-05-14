
import pandas as pd
import numpy as np
import stringcase
import traceback

def get_data_category(series):
    if pd.api.types.is_bool_dtype(series.dtype):
        return 'bool'
    elif pd.api.types.is_numeric_dtype(series.dtype):
        return 'numeric'
    elif isinstance(series.dtype, pd.CategoricalDtype):
        return 'categorical'
    elif pd.api.types.is_datetime64_any_dtype(series.dtype):
        return 'datetime'
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
    df = df.reset_index()
    description = pd.DataFrame({
      'name': [convert_to_nice_string(col) for col in df.columns],
      'column': df.columns,
      'name_tech': [str(i+1) for i in range(len(df.columns))],
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


def apply(cases: pd.DataFrame):
  try:
    meta = _describe_dataframe(cases)
    return meta
  except Exception as err: 
      traceback.print_exc()
