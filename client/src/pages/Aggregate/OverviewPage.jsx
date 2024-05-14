import { PageLayout, SplitPageLayout } from "@primer/react";
import axios from "axios";
import { useLoaderData } from "react-router-dom";

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

export default function OverviewPage() {
  const { aggregates } = useLoaderData();

  return (
    <>
      <SplitPageLayout.Content>asdf</SplitPageLayout.Content>
    </>
  );
}
