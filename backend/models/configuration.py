from . import Workspace
from uuid import UUID, uuid4

class Configuration():
    workspaces: list[Workspace]
    current_workspace_id: UUID

    def __init__(self, 
                 name: str ="Variant Explorer", 
                 author: str="Tobias Fehrer",
                 workspaces: list[Workspace] = []):
        self.workspaces = workspaces
        self.current_workspace_id: UUID = None
        self.name = name
        self.author = author  
        

    def get_workspace(self, workspace_id: UUID) -> Workspace:
        for w in self.workspaces:
            if w.id == workspace_id:
                return w

    def add_workspace(self, workspace: Workspace):
        workspace.ensure_directory()
        self.workspaces.append(workspace)

    def update_workspace(self, workspace: Workspace):
        for i, w in enumerate(self.workspaces):
            if w.id == workspace.id:
                self.workspaces[i] = workspace

    def delete_workspace(self, workspace_id: UUID):
        self.workspaces = [w for w in self.workspaces if w.id != workspace_id]