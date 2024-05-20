from typing import List, Mapping, Tuple
from uuid import UUID, uuid4
from datetime import datetime


class Job:
  def __init__(self, workspace_id: UUID, job_name: str, job_data: Mapping[str, str]=None):
    self.job_id = uuid4()
    self.workspace_id = workspace_id
    self.job_name = job_name
    self.data = job_data
    self.status = 'Pending'
    self.fulfillment = 0
    self.created_at = datetime.now()
    self.completed_at = None

  def get_job_status(self) -> Tuple[str, int]:
    return self.status, self.fulfillment

  def update_job_status(self, status: str) -> None:
    self.data['status'] = status

  def start_job(self) -> None: 
    self.status = 'Started'
    print(f'Job {self.job_name} started with workspace {str(self.workspace_id)}')
    self.fulfillment = 0

  def complete_job(self) -> None:
    self.status = 'Completed'
    self.fulfillment = 100
    self.completed_at = datetime.now()

  def fail_job(self) -> None:
    self.status = 'Failed'
    self.fulfillment = 100
    self.completed_at = datetime.now()

  def __getitem__(self, key: str) -> str:
    return self.data[key]
  
  def __str__(self) -> str:
    return f'{self.job_name} - {self.status}'

class JobList:
  def __init__(self):
    self.jobs = {}

  def filter_jobs(self, workspace_id: UUID=None, job_name: str=None, status: str=None):
    filtered_jobs = {}
    for job_id, job in self.jobs.items():
      if (workspace_id is None or job.workspace_id == workspace_id) and \
         (job_name is None or job.job_name == job_name) and \
         (status is None or job.status == status):
        filtered_jobs[job_id] = job
    return filtered_jobs

  def add_job(self, job: Job) -> None:
    self.jobs[job.job_id] = job

  def get_job(self, job_id: UUID) -> Job:
    if job_id in self.jobs:
      return self.jobs[job_id]
    else:
      return 'Job not found'
    
  def delete_job(self, job_id: UUID) -> None:
    if job_id in self.jobs:
      del self.jobs[job_id]
