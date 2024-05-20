import { useContext } from "react";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Heading, Text } from "@primer/react";
import { ApiContext } from "../../main";

export default function GroupBySplitterComponent({ column }) {
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const navigate = useNavigate();

  const split = (id) => {
    axios
      .post(`${apiUrl}/aggregates/splitAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        split_type: "group_by",
        by: column.name,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
      });
  };

  return (
    <div>
      <Button
        onClick={() => split(aggregate.id)}
        count={column.distinct_values}
      >
        Split
      </Button>
    </div>
  );
}
