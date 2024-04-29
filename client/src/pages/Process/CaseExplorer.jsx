import { Box, PageLayout } from "@primer/react";
import { useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  // fake async call and return data
  const cases = {
    artefacts: [
      {
        createdAt: "2022-03-28T13:13:41.042530+00:00",
        description: null,
        id: "1",
        modelType: null,
        name: "bpi_ch_2020_prepaidtravelcost",
        type: "evlog",
      },
    ],
    canDestroy: true,
    canDownload: true,
    canUpload: true,
    createdAt: "2022-03-28T13:13:18.047277+00:00",
    description: "asdfasas",
    id: "1",
    name: "BPI",
  };
  return new Promise((resolve) => setTimeout(resolve({ cases }), 300));
}

export default function ProcessOverview() {
  const { cases } = useLoaderData();
  return (
    <>
      <PageLayout.Pane></PageLayout.Pane>
      <PageLayout.Content>
        <Box
          sx={{
            border: "1px solid",
            borderRadius: 2,
            borderColor: "border.default",
            height: 200,
          }}
        ></Box>
      </PageLayout.Content>
    </>
  );
}
