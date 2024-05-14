import { useContext } from "react";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Text } from "@primer/react";
import { ApiContext } from "../../main";

export default function GroupBySplitterComponent({ column }) {
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const navigate = useNavigate();

  console.log(aggregate.data.columns);

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
      <h1>
        {column.display_name} {column.distinct_values}
      </h1>
      <Text>{column.description}</Text>
      {!column.value_dict &&
        column.head &&
        column.head.map((value) => <Text>{value}</Text>)}
      {column.value_dict &&
        Object.entries(column.value_dict).map(([key, value]) => (
          <div key={key}>
            <Text>{key}</Text>
            <Text>{value}</Text>
          </div>
        ))}
      <Button onClick={() => split(aggregate.id)}>Split</Button>
    </div>
  );
}
