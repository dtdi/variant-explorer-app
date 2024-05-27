import { TableIcon } from "@primer/octicons-react";
import { ActionList, AnchoredOverlay, Button } from "@primer/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiContext } from "../../main";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";

export default function MultiColumnSplitter({ columns }) {
  const working_columns = columns
    .filter(
      (column) =>
        column.visible &&
        column.distinct_values > 1 &&
        column.distinct_values < 5
    )
    .sort((a, b) => a.distinct_values - b.distinct_values);
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const navigate = useNavigate();

  const [selectedIndices, setSelectedIndices] = useState([]);
  const handleSelect = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

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
  if (working_columns.length === 0) {
    return null;
  }
  return (
    <AnchoredOverlay
      open={open}
      onClose={toggle}
      onOpen={toggle}
      renderAnchor={(props) => (
        <Button title={"Split accross columns"} {...props}>
          Multisplit
        </Button>
      )}
    >
      <ActionList
        selectionVariant="multiple"
        showDividers
        role="menu"
        aria-label="Project"
      >
        {working_columns.map((column, index) => (
          <ActionList.Item
            key={index}
            role="menuitemcheckbox"
            selected={selectedIndices.includes(index)}
            aria-checked={selectedIndices.includes(index)}
            onSelect={() => handleSelect(index)}
          >
            {column.name}
            <ActionList.Description variant="block">
              {column.distinct_values} distinct values
            </ActionList.Description>
          </ActionList.Item>
        ))}
        <ActionList.Divider />
        <ActionList.Item
          onClick={() =>
            groupBySplit(selectedIndices.map((i) => working_columns[i].name))
          }
        >
          Split by Groups
        </ActionList.Item>
      </ActionList>
    </AnchoredOverlay>
  );
}
