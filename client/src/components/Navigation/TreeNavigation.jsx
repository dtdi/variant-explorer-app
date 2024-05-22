import { useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { Label, Octicon, TreeView } from "@primer/react";
import { DiffAddedIcon, WorkflowIcon } from "@primer/octicons-react";
import axios from "axios";
import { ApiContext } from "../../main";

const splitColorMap = {};

const getSplitColor = (split) => {
  if (!splitColorMap[split]) {
    splitColorMap[split] = `#${Math.floor(Math.random() * 16777215).toString(
      16
    )}`;
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
      <span style={{ color: getSplitColor(data?.split?.id) }}>{data.name}</span>

      <TreeView.TrailingVisual>
        <Label variant="secondary">{data.stats.number_cases}</Label>
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
          <TreeView.LeadingVisual>
            <WorkflowIcon />
          </TreeView.LeadingVisual>
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
