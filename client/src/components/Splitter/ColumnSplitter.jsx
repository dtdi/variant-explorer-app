import { useContext } from "react";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ActionList,
  ActionMenu,
  Button,
  ButtonGroup,
  Heading,
  Text,
} from "@primer/react";
import { GlobalContext } from "../../global-context";
import { formatNumber } from "../../utils";

export default function ColumnSplitter({ column }) {
  const { apiUrl, isLoading, setIsLoading, addToast } =
    useContext(GlobalContext);
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const navigate = useNavigate();

  const getBinArray = (maxValue) => {
    const maxLength = 10;
    if (maxValue <= maxLength) {
      return Array.from({ length: maxValue }, (_, i) => i + 1);
    }
    const step = Math.ceil(maxValue / maxLength);
    return Array.from({ length: maxLength }, (_, i) => (i + 1) * step);
  };

  const groupBySplit = (columns) => {
    setIsLoading(true);
    axios
      .post(`${apiUrl}/aggregates/splitAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        split_type: "group_by",
        by: columns,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
        addToast("Split created", "created a new split");
      })
      .finally(() => setIsLoading(false));
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

  const qCutSplit = (column, q) => {
    axios
      .post(`${apiUrl}/aggregates/splitAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        split_type: "q_cut",
        by: [column],
        q: q,
      })
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.id}`);
      });
  };

  if (
    column.distinct_values <= 1 ||
    (column.distinct_values > 30 && !column.bin_sizes)
  ) {
    return (
      <div>
        <Button
          title={`You cannot further split this column as it has only one value`}
          disabled
          variant="invisible"
          size="small"
        >
          Create Splits
        </Button>
      </div>
    );
  }

  return (
    <ActionMenu>
      <ActionMenu.Button
        variant="invisible"
        title="Split into groups based on the unique values in this column"
        size="small"
        count={column.distinct_values}
      >
        Create Splits
      </ActionMenu.Button>
      <ActionMenu.Overlay>
        <ActionList>
          {column.distinct_values < 30 && (
            <ActionList.Item onClick={() => groupBySplit([column.name])}>
              Group By
              <ActionList.Description variant="block">
                Split into {column.distinct_values} groups
              </ActionList.Description>
            </ActionList.Item>
          )}
          {column.bin_sizes > 0 && (
            <>
              <ActionMenu>
                <ActionMenu.Anchor>
                  <ActionList.Item>
                    Cut
                    <ActionList.Description variant="block">
                      Cut into equal-width groups
                    </ActionList.Description>
                  </ActionList.Item>
                </ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList>
                    {getBinArray(column.bin_sizes).map((i) => (
                      <ActionList.Item
                        key={i}
                        onClick={() => cutSplit(column.name, i)}
                      >
                        {i} Bins
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
              <ActionMenu>
                <ActionMenu.Anchor>
                  <ActionList.Item>
                    Q-Cut
                    <ActionList.Description variant="block">
                      Cut into equal-sized groups
                    </ActionList.Description>
                  </ActionList.Item>
                </ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList>
                    {getBinArray(column.bin_sizes).map((i) => (
                      <ActionList.Item
                        key={i}
                        onClick={() => qCutSplit(column.name, i)}
                      >
                        {i} Bins
                        <ActionList.Description variant="block">
                          each with {formatNumber(column.distinct_values / i)}{" "}
                          items
                        </ActionList.Description>
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}
