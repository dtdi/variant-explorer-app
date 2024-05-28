import time

from pmxplain import algo
from pmxplain.algo.transformation.log_to_df import import_log, generate_features, describe_meta
from pmxplain.algo.querying.llm import abstract_aggregate


from pmxplain.meta import __name__, __version__, __doc__, __author__, __author_email__,  __maintainer__, __maintainer_email__

time.clock = time.process_time
