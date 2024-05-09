from treelib import Node, Tree as _Tree
import pmxplain.algo.split.split as split
import json
from uuid import UUID, uuid4

from models import Aggregate

class Tree(_Tree):
  def to_map(self) -> dict:
    nodes = self.all_nodes()
    return { str(node._identifier): (None if node.predecessor(self._identifier) is None else str(node.predecessor(self._identifier))) for node in nodes }
  
  def get_breadcrumbs(self, nid):
     crumbs = [ { "id": n, "name": self.get_node(n).data.name} for n in self.rsearch(nid)]
     crumbs.reverse()
     level = len(crumbs) -1
     return crumbs, level


  def split_node(self, node, splitter: split.Split):
    if not isinstance(node, Node):
      node = self.get_node(node)
    agg: Aggregate = node.data

    grouped = splitter.split(agg.cases)
    
    for name, cases in grouped:
      new_agg = Aggregate(
         id=uuid4(),
        name=str(name),
        workspace_id=agg.workspace_id,
        cases=cases,
        )
      new_agg.initialize()
      new_agg.save()
      print(f"Splitting {new_agg.name} into {new_agg.id}")
      self.create_node(new_agg.name, str(new_agg.id), parent=node, data=new_agg)

    return self.children(node._identifier)


  @classmethod
  def from_map(cls, child_parent_dict, id_func=None, data_func=None):
      """
      takes a dict with child:parent, and form a tree
      """
      tree = cls()
      if tree is None or tree.size() > 0:
          raise ValueError("need to pass in an empty tree")
      id_func = id_func if id_func else lambda x: x
      data_func = data_func if data_func else lambda x: None
      parent_child_dict = {}
      root_node = None
      for k, v in child_parent_dict.items():
          if v is None and root_node is None:
              root_node = k
          elif v is None and root_node is not None:
              raise ValueError("invalid input, more than 1 child has no parent")
          else:
              if v in parent_child_dict:
                  parent_child_dict[v].append(k)
              else:
                  parent_child_dict[v] = [k]
      if root_node is None:
          raise ValueError("cannot find root")

      tree.create_node(root_node, id_func(root_node), data=data_func(root_node))
      queue = [root_node]
      while len(queue) > 0:
          parent_node = queue.pop()
          for child in parent_child_dict.get(parent_node, []):
              tree.create_node(
                  child,
                  id_func(child),
                  parent=id_func(parent_node),
                  data=data_func(child),
              )
              queue.append(child)
      return tree
  
  @classmethod
  def from_file(cls, file_name=str, workspace_id=UUID) -> 'Tree':
    with open(file_name, "r") as f:
      tree = Tree.from_map(json.load(f), 
        data_func=lambda x: Aggregate.load(workspace_id, x) )
      return tree
    
  def save_to_file(self, file_name: str):
    with open(file_name, "w") as f:
      f.write(json.dumps(self.to_map()))