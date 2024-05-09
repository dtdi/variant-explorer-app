import { Box, PageLayout } from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { useContext, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { WorkspaceContext } from "../../routes/WorkspaceRoot";

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
  const { workspace, aggregate, stats } = useContext(WorkspaceContext);

  const [loading, setLoading] = useState(false);

  const data = [{ name: "bpi_ch_2020_prepaidtravelcost" }];

  const columns = [
    {
      header: "Repository",
      field: "name",
      rowHeader: true,
    },
  ];
  return (
    <>
      <PageLayout.Pane>adfasfd</PageLayout.Pane>
      <PageLayout.Content>
        {!loading && cases.length == 0 ? (
          <Blankslate>
            <Blankslate.Heading>Blankslate heading</Blankslate.Heading>
            <Blankslate.Description>
              Use it to provide information when no dynamic content exists.
            </Blankslate.Description>
          </Blankslate>
        ) : (
          <Table.Container>
            <Table.Title>Cases</Table.Title>
            <Table.Subtitle>afasfasf</Table.Subtitle>

            {loading ? (
              <Table.Skeleton columns={columns} />
            ) : (
              <>
                <DataTable data={data} columns={columns} />
                <Table.Pagination
                  aria-label="Pagination for Cases"
                  pageSize={30}
                  totalCount={stats.number_cases}
                  onChange={({ pageIndex }) => {
                    setPageIndex(pageIndex);
                  }}
                />
              </>
            )}
          </Table.Container>
        )}
      </PageLayout.Content>
    </>
  );
}
