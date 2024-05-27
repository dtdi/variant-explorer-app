import { useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { Label, Octicon, TreeView } from "@primer/react";
import { DiffAddedIcon, PinIcon, WorkflowIcon } from "@primer/octicons-react";
import axios from "axios";
import { formatNumber } from "../../utils";
import { ApiContext } from "../../main";

const splitColorMap = {};

function randomColor(level) {
  const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var h = randomInt(0, 36) * 10;
  var s = Math.min(40 + 10 * level, 90);
  var l = randomInt(20, 40);
  return `hsl(${h},${s}%,${l}%)`;
}

const getSplitColor = (split, level) => {
  if (!splitColorMap[split]) {
    splitColorMap[split] = randomColor(level);
  }
  return splitColorMap[split];
};

function TreeNavigation({ data, children, level }) {
  const { workspace, aggregate } = useContext(AggregateContext);
  const navigate = useNavigate();
  return (
    <TreeView.Item
      current={aggregate._identifier === data.id}
      id={data.id}
      defaultExpanded={level < 2}
      onSelect={() => {
        navigate(`/workspace/${workspace.id}/${data.id}`);
      }}
    >
      <TreeView.LeadingVisual>
        {children ? <TreeView.DirectoryIcon /> : <WorkflowIcon />}
      </TreeView.LeadingVisual>
      <span style={{ color: getSplitColor(data?.split?.id, level) }}>
        {data.name}
      </span>

      <TreeView.TrailingVisual>
        {data.bookmark_id !== null && <Octicon sx={{ mr: 1 }} icon={PinIcon} />}
        <Label title={`${data.stats.number_cases} cases`} variant="secondary">
          {formatNumber(data.stats.fraction_total_cases * 100, 1)}%
        </Label>
      </TreeView.TrailingVisual>
      {children && (
        <TreeView.SubTree>
          {children.map((childContainer) =>
            Object.entries(childContainer).map(([key, value]) => (
              <TreeNavigation
                key={key}
                level={level + 1}
                data={value.data}
                children={value.children}
              />
            ))
          )}
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  );
}

export default function AggregateNavigation({ up }) {
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate } = useContext(AggregateContext);
  const [isLoading, setIsLoading] = useState(false);
  const [aggregates, setAggregates] = useState({});

  useEffect(() => {
    if (!up) return;
    setIsLoading(true);
    axios
      .get(`${apiUrl}/aggregates/${aggregate._identifier}?up=${up}`)
      .then((res) => setAggregates(res.data.aggregates))
      .finally(() => setIsLoading(false));
  }, [aggregate, up]);

  if (isLoading) {
    return (
      <TreeView aria-label="Aggregates">
        <TreeView.Item defaultExpanded={true}>
          {workspace.name}
          <TreeView.SubTree state="loading" count={15}></TreeView.SubTree>
        </TreeView.Item>
      </TreeView>
    );
  }

  return (
    <TreeView aria-label="Aggregates">
      {Object.entries(aggregates).map(([key, value]) => (
        <TreeNavigation
          key={key}
          level={0}
          data={value.data}
          children={value.children}
        />
      ))}
    </TreeView>
  );
}
