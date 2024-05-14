import {
  DiffAddedIcon,
  DiffModifiedIcon,
  FileIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import { Box, Octicon, PageLayout, TreeView } from "@primer/react";
import axios from "axios";
import { useContext } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import TreeNavigation from "../../components/Navigation/TreeNavigation";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  const request = {
    workspace: workspaceId,
    aggregate: aggregateId,
  };

  const { aggregates } = await axios
    .get(`${apiUrl}/aggregates/${aggregateId}?up=3`)
    .then((res) => res.data);

  return { aggregates };
}

export default function ProcessAggregates() {
  const { aggregates } = useLoaderData();

  return (
    <>
      <PageLayout.Content>
        <nav aria-label="Aggregates">
          <TreeView aria-label="Aggregates">
            {Object.entries(aggregates).map(([key, value]) => (
              <TreeNavigation
                level={0}
                data={value.data}
                children={value.children}
              />
            ))}
          </TreeView>
        </nav>
      </PageLayout.Content>
    </>
  );
}
