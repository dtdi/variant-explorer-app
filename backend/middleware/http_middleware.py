import logging
import traceback

from fastapi import Request

from util.util import build_json_error_rsp, get_trace

logger = logging.getLogger("uvicorn")


async def http_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(
            "".join(
                traceback.format_exception(e)
            )
        )
        return build_json_error_rsp(str(e), get_trace(e), 500)
