import uvicorn

from multiprocessing import cpu_count, freeze_support

from uuid import UUID
from fastapi import FastAPI, HTTPException, Depends, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from error_handlers import http_exception_handler, validation_exception_handler, exception_handler
from api.routes.api import router as api_router
from core.events import create_start_app_handler, create_stop_app_handler
from middleware.http_middleware import http_middleware

from util.config.repo import (
    ConfigurationRepository,
    ConfigurationRepositoryFactory,
)

import cache.cache as cache

def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()

def get_application():
    app = FastAPI()
    add_event_handlers(app)
    add_middleware(app)
    add_exception_handlers(app)
    app.include_router(api_router)
    return app


def add_event_handlers(app: FastAPI):
    app.add_event_handler(
        "startup",
        create_start_app_handler(app),
    )
    app.add_event_handler(
        "shutdown",
        create_stop_app_handler(app),
    )


def add_middleware(app: FastAPI):
    app.middleware("http")(http_middleware)
    origins = ["http://localhost", "http://localhost:8080", "http://localhost:4444", "http://localhost:5173"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def add_exception_handlers(app: FastAPI):
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

app = get_application()

@app.get("/environment")
async def get_environment(repo: ConfigurationRepository = Depends(get_config_repo)):
    conf = repo.get_configuration()
    conf.count_workspaces = len(conf.workspaces)
    return conf


@app.get("/session")
async def get_info():
    return {
      "can_download": False,
      "can_upload": True,
      "is_admin": True,
      "log_visibility": True,
      "session": "9bbc7ffe-dd2d-4174-ad1c-04731dcc2bee",
      "status": "OK",
      "user": "1"
    }

@app.get("/jobs")
async def get_jobs(workspace_id:UUID= None, job_name: str=None, status: str= None):
  return cache.joblist.filter_jobs(workspace_id=workspace_id, job_name= job_name, status= status)

@app.get("/job")
async def get_job(job_id: UUID):
    return cache.joblist.get_job(job_id)

# Using FastAPI instance
@app.get("/url-list")
def get_all_urls():
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

if __name__ == "__main__":
    freeze_support()
    uvicorn.run(
        "main:app", host="0.0.0.0", port=41211, workers=1, reload=True
    )
    # dev mode
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)