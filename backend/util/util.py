import traceback

from fastapi.responses import JSONResponse


def get_trace(e):
    return "".join(
        traceback.format_exception(e)
    )


def build_json_error_rsp(detail, stack_trace, status_code):
    return JSONResponse(
        {"detail": detail, "stack_trace": stack_trace}, status_code=status_code
    )
