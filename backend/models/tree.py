from treelib import Node, Tree as _Tree
from treelib.exceptions import NodeIDAbsentError
import models.aggregate
import pmxplain.algo.split.split as split
import json
from uuid import UUID, uuid4
import models as models

from models.aggregate import Stats

class Tree(_Tree):

  def _get_nav_dict_data(self, nid):
    data = self[nid].data
    return { 
       "name": data.name, 
       "id": str(data.id), 
       "bookmark_id": data.bookmark_id,
       "stats": data.stats,
       "description": data.description,
       "split": data.split if data.split else None}

  def to_nav_dict(self, nid=None, key=None, sort=True, reverse=False):
        """Transform the whole tree into a dict."""

        nid = self.root if (nid is None) else nid
        ntag = self[nid].tag
        tree_dict = {ntag: {"children": []}}
        tree_dict[ntag]["data"] = self._get_nav_dict_data(nid)

        if self[nid].expanded:
            queue = [self[i] for i in self[nid].successors(self._identifier)]
            key = (lambda x: x) if (key is None) else key
            if sort:
                queue.sort(key=key, reverse=reverse)

            for elem in queue:
                tree_dict[ntag]["children"].append(
                    self.to_nav_dict(
                        elem.identifier, sort=sort, reverse=reverse
                    )
                )
            if len(tree_dict[ntag]["children"]) == 0:
                tree_dict = (
                    {ntag: {"data": self._get_nav_dict_data(nid)}}
                )
            return tree_dict


  def to_map(self) -> dict:
    nodes = self.all_nodes()
    return { str(node._identifier): (None if node.predecessor(self._identifier) is None else str(node.predecessor(self._identifier))) for node in nodes }
  
  def get_nid_x_levels(self, nid, levels=1):
     crumbs = [ n for n in self.rsearch(nid)]
     if levels > len(crumbs):
        return crumbs[-1]
     return crumbs[levels-1]

  def get_breadcrumbs(self, nid):
     crumbs = [ { "id": n, "name": self.get_node(n).data.name} for n in self.rsearch(nid)]
     crumbs.reverse()
     level = len(crumbs) -1
     return crumbs, level


  def split_node(self, node, splitter: split.Split):
    if not isinstance(node, Node):
      node = self.get_node(node)
    agg = node.data

    grouped = splitter.split(agg.cases)
    
    for name, cases in grouped:
      new_agg = models.aggregate.Aggregate(
         id=uuid4(),
        name=splitter.aggregate_name(name, agg),
        split=splitter.split_model,
        workspace_id=agg.workspace_id,
        cases=cases,
        stats=Stats(),

      )
      new_agg.initialize()
      new_agg.save()
      print(f"Splitting {new_agg.name} into {new_agg.id}")
      self.create_node(new_agg.name, str(new_agg.id), parent=node, data=new_agg)

    return self.children(node._identifier)

  def remove_aggregate(self, identifier):
        """Remove an aggregate indicated by 'identifier' with all its successors.
        Return the number of removed nodes.
        """
        if not self.contains(identifier):
            raise NodeIDAbsentError("Node '%s' " "is not in the tree" % identifier)

        parent = self[identifier].predecessor(self._identifier)

        # Remove node and its children
        removed = list(self.expand_tree(identifier))

        for id_ in removed:
            if id_ == self.root:
                self.root = None
            self.__update_bpointer(id_, None)
            for cid in self[id_].successors(self._identifier) or []:
                self.__update_fpointer(id_, cid, self.node_class.DELETE)

        # Update parent info
        self.__update_fpointer(parent, identifier, self.node_class.DELETE)
        self.__update_bpointer(identifier, None)

        for id_ in removed:
            self.nodes.pop(id_)
        return len(removed)


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
    try:
      with open(file_name, "r") as f:
        tree = Tree.from_map(json.load(f), 
          data_func=lambda x: models.aggregate.Aggregate.load(workspace_id, x) )
        return tree
    except FileNotFoundError:
        print(f"tree does not exist : {file_name}")
        return cls()
    except Exception as e:
        print(f"error loading tree: {e}")
      
    
  def save_to_file(self, file_name: str):
    with open(file_name, "w") as f:
      f.write(json.dumps(self.to_map()))