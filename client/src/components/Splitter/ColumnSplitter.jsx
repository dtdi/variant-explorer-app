import { useContext } from "react";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Heading, Text } from "@primer/react";
import { ApiContext } from "../../main";

export default function ColumnSplitter({ column }) {
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const navigate = useNavigate();

  const groupBySplit = (columns) => {
    axios
      .post(`${apiUrl}/aggregates/splitAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        split_type: "group_by",
        by: columns,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
      });
  };

  const cutSplit = (column, bins) => {
    axios
      .post(`${apiUrl}/aggregates/splitAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        split_type: "cut",
        by: [column],
        bins: bins,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
      });
  };

  if (column.distinct_values <= 1) {
    return (
      <div>
        <Button
          title={`You cannot further split this column as it has only one value`}
          disabled
        >
          Split
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="invisible"
        size="small"
        title={`Split into ${column.distinct_values} groups`}
        onClick={() => groupBySplit([column.name])}
        count={column.distinct_values}
      >
        Split
      </Button>
      <Button
        title={`Split into 4 groups`}
        onClick={() => cutSplit(column.name, 4)}
      >
        Cut Split
      </Button>
    </div>
  );
}
