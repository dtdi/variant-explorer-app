import {
  DiffAddedIcon,
  DiffModifiedIcon,
  FileIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import { Box, Octicon, PageLayout, TreeView } from "@primer/react";
import axios from "axios";
import { Link, useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  const request = {
    workspace: workspaceId,
    aggregate: aggregateId,
  };

  const { aggregates } = await axios
    .get(`${apiUrl}/aggregates/${aggregateId}`)
    .then((res) => res.data);

  return { aggregates };
}

const MySubTree = ({ aggregates }) => {
  return (
    <TreeView.SubTree>
      {aggregates.map((aggregate) => (
        <TreeView.Item id={aggregate.id}>
          <TreeView.LeadingVisual>
            <FileIcon />
          </TreeView.LeadingVisual>
          {aggregate.name}
          <TreeView.TrailingVisual>
            <Octicon
              icon={DiffAddedIcon}
              color="success.fg"
              aria-label="Added"
            />
          </TreeView.TrailingVisual>
        </TreeView.Item>
      ))}
    </TreeView.SubTree>
  );
};

export default function ProcessAggregates() {
  const { aggregates } = useLoaderData();

  Object.keys(aggregates).map((key) => {
    console.log(key, aggregates[key].data.name);
  });

  return (
    <>
      <PageLayout.Content>
        <nav aria-label="Aggregates">
          <TreeView aria-label="Aggregates">
            <TreeView.Item id="src" defaultExpanded>
              <TreeView.LeadingVisual>
                <Octicon icon={WorkflowIcon} />
              </TreeView.LeadingVisual>

              <TreeView.SubTree>
                <TreeView.Item id="src/Avatar.tsx">
                  <TreeView.LeadingVisual>
                    <FileIcon />
                  </TreeView.LeadingVisual>
                  Avatar.tsx
                  <TreeView.TrailingVisual>
                    <Octicon
                      icon={DiffAddedIcon}
                      color="success.fg"
                      aria-label="Added"
                    />
                  </TreeView.TrailingVisual>
                </TreeView.Item>
                <TreeView.Item id="src/Button.tsx" current>
                  <TreeView.LeadingVisual>
                    <FileIcon />
                  </TreeView.LeadingVisual>
                  Button.tsx
                  <TreeView.TrailingVisual>
                    <Octicon
                      icon={DiffModifiedIcon}
                      color="attention.fg"
                      aria-label="Modified"
                    />
                  </TreeView.TrailingVisual>
                </TreeView.Item>
              </TreeView.SubTree>
            </TreeView.Item>
            <TreeView.Item id="package.json">
              <TreeView.LeadingVisual>
                <FileIcon />
              </TreeView.LeadingVisual>
              package.json
              <TreeView.TrailingVisual>
                <Octicon
                  icon={DiffModifiedIcon}
                  color="attention.fg"
                  aria-label="Modified"
                />
              </TreeView.TrailingVisual>
            </TreeView.Item>
          </TreeView>
        </nav>
      </PageLayout.Content>
    </>
  );
}
