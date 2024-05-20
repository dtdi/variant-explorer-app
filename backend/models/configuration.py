from . import Workspace
from uuid import UUID, uuid4
from pydantic import BaseModel, computed_field
from typing import Union
from models.workspace import Workspace

class Setting(BaseModel):
    value: Union[str, int, float, bool]
    type: str = "string"

class Configuration(BaseModel):
    workspaces: list[Workspace] = []
    current_workspace_id: Union[UUID,None] = None
    settings: dict[str, Setting] = {}
    name: str = "default"
    author: str = "default"

    @property
    @computed_field
    def count_workspaces(self):
        return len(self.workspaces)

    def get_settings(self):
      settings_dict = {}
      for name, setting in self.settings.items():
        settings_dict[name] = self.get_setting(name)
      return settings_dict

    def get_setting(self, name: str):
        try:
            setting = self.settings.get(name)
            if setting:
              if setting.type == "string":
                return setting.value
              elif setting.type == "int":
                return int(setting.value)
              elif setting.type == "float":
                return float(setting.value)
              elif setting.type == "bool":
                return bool(setting.value)
              else:
                return setting.value
            else:
              return None
        except Exception as e:
            pass
    

    def set_setting(self, name: str, value: str):
          if isinstance(value, str):
            setting_type = "string"
          elif isinstance(value, int):
            setting_type = "int"
          elif isinstance(value, float):
            setting_type = "float"
          elif isinstance(value, bool):
            setting_type = "bool"
          else:
            setting_type = "unknown"
          self.settings[name] = Setting(value=value, type=setting_type)

    def set_setting(self, name: str, value: str, type: str):
        self.settings[name] = Setting(value=value, type=type)
        

    def get_workspace(self, workspace_id: UUID) -> Workspace:
        workspace = None
        for w in self.workspaces:
            if w.id == workspace_id:
                workspace = w
        if workspace is None:
            raise ValueError(f"Workspace {str(workspace_id)} not found")
        return workspace

    def add_workspace(self, workspace: Workspace):
        workspace.ensure_directory()
        self.workspaces.append(workspace)

    def update_workspace(self, workspace: Workspace):
        for i, w in enumerate(self.workspaces):
            if w.id == workspace.id:
                self.workspaces[i] = workspace

    def delete_workspace(self, workspace_id: UUID):
        workspace = self.get_workspace(workspace_id)
        workspace.delete()
        self.workspaces = [w for w in self.workspaces if w.id != workspace_id]