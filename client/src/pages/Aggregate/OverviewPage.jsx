import { PageLayout, SplitPageLayout } from "@primer/react";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useContext } from "react";
import GroupBySplitterComponent from "../../components/Splitter/GroupBySplitterComponent";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  return { apiUrl };
}

export default function OverviewPage() {
  const { apiUrl } = useLoaderData();
  const { workspace, aggregate, stats } = useContext(AggregateContext);

  return (
    <>
      {aggregate.data.name}
      {aggregate.data.columns.map((column) => (
        <div key={column.id}>
          <GroupBySplitterComponent column={column} />
        </div>
      ))}
    </>
  );
}
