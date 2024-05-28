import {
  DiffAddedIcon,
  DiffModifiedIcon,
  FileIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import {
  Box,
  Octicon,
  PageLayout,
  SegmentedControl,
  TreeView,
} from "@primer/react";
import axios from "axios";
import { useContext, useState } from "react";
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import AggregateCard from "../../components/AggregateCard";

export async function loader({ params, request }) {
  const { workspaceId, aggregateId } = params;
  const projection =
    new URL(request.url).searchParams.get("projection") || "subtree";

  const apiUrl = "http://localhost:41211";

  const { aggregates } = await axios
    .get(`${apiUrl}/aggregates/${aggregateId}/flat?projection=${projection}`)
    .then((res) => res.data);

  return { aggregates };
}

export default function ProcessAggregates() {
  const { aggregates } = useLoaderData();
  let [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (i) => {
    if (i === 0) {
      setSearchParams({ projection: "subtree" });
    } else {
      setSearchParams({ projection: "children" });
    }
  };

  return (
    <>
      <PageLayout.Content>
        <SegmentedControl onChange={handleChange} aria-label="Group View">
          <SegmentedControl.Button
            selected={searchParams.get("projection") === "subtree"}
          >
            Subtree
          </SegmentedControl.Button>
          <SegmentedControl.Button
            selected={searchParams.get("projection") == "children"}
          >
            Children
          </SegmentedControl.Button>
        </SegmentedControl>
      </PageLayout.Content>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 3,
          mt: 3,
          mb: 3,
        }}
      >
        {aggregates?.map((aggregate) => (
          <AggregateCard aggregate={aggregate} key={aggregate._identifier} />
        ))}
      </Box>
    </>
  );
}
