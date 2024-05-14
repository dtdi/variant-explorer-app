import { useContext } from "react";
import { AggregateContext } from "../../routes/Workspaceroot";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function GroupBySplitterComponent() {
  const { workspace, aggregate } = useContext(AggregateContext);
  const navigate = useNavigate();

  const split = (id) => {
    axios
      .post(`${apiUrl}/split`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate.id,
        split_id: id,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
      });
  };

  return (
    <div>
      <h1>GroupBySplitterComponent</h1>
    </div>
  );
}
