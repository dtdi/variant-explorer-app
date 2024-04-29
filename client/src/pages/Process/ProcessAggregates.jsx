import { Box, PageLayout } from "@primer/react";
import { Link, useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  // fake async call and return data
  const processAggregates = [
    {
      uuid: "d68b49ba-1c09-4b01-8bf7-2d586798db25",
      name: "Aggregate 1",
      display_name: "Aggregate 1",
      description: "This is aggregate 1",
      parent: null,
      grouped_by: ["case:concept:name"],
      aspect: "performance",
      createdAt: "2022-03-28T13:13:41.042530+00:00",
      number_cases: 111,
      number_events: 312312,
      number_children: 2,
      features: [],
    },
    {
      uuid: "799f9add-c870-4c29-be0f-28b6c400e57e",
      name: "Aggregate 2",
      description: "This is aggregate 2",
      createdAt: "2022-03-28T13:13:41.042530+00:00",
    },
  ];
  return new Promise((resolve) =>
    setTimeout(resolve({ processAggregates }), 300)
  );
}

export default function ProcessAggregates() {
  const { processAggregates } = useLoaderData();

  return (
    <>
      <PageLayout.Content>
        {processAggregates.map((aggregate) => (
          <Box
            key={aggregate.uuid}
            sx={{
              border: "1px solid",
              borderRadius: 2,
              borderColor: "border.default",
              height: 100,
              marginBottom: 2,
              padding: 2,
            }}
          >
            {aggregate.name}
            <Link to={`/aggregate/${aggregate.uuid}`}>View</Link>
          </Box>
        ))}
      </PageLayout.Content>
    </>
  );
}
