import { Box, PageLayout } from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { useContext, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { BookIcon } from "@primer/octicons-react";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  const request = {
    workspace_id: workspaceId,
    aggregate_id: aggregateId,
    page: 1,
    page_size: 5,
  };

  const table = await axios
    .post(`${apiUrl}/cases`, request)
    .then((res) => res.data);

  return table;
}

export default function ProcessOverview() {
  const { cases, table_data, columns } = useLoaderData();
  const { workspace, aggregate, stats } = useContext(AggregateContext);

  const [loading, setLoading] = useState(false);
  const [the_case, setCase] = useState(null);

  const data = cases;

  if (!loading && cases.length == 0) {
    return (
      <Blankslate border={true} spacious={true}>
        <Blankslate.Heading>No cases in Aggregate</Blankslate.Heading>
        <Blankslate.Description>
          Use it to provide information when no dynamic content exists.
        </Blankslate.Description>
      </Blankslate>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Table.Container sx={{ flexGrow: 1 }}>
        <Table.Title>Cases</Table.Title>
        <Table.Subtitle>afasfasf</Table.Subtitle>

        {loading ? (
          <Table.Skeleton columns={columns} />
        ) : (
          <>
            <DataTable data={data} columns={columns} />
            <Table.Pagination
              aria-label="Pagination for Cases"
              pageSize={table_data.page_size}
              totalCount={table_data.total}
              onChange={({ pageIndex }) => {
                setPageIndex(pageIndex);
              }}
            />
          </>
        )}
      </Table.Container>
      <Box
        sx={{
          width: "300px",
          borderRadius: 2,
          m: 3,
          p: 3,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "border.default",
        }}
      >
        {the_case ? (
          asdf
        ) : (
          <Blankslate spacious={true}>
            <Blankslate.Visual>
              <BookIcon size={"medium"} />
            </Blankslate.Visual>
            <Blankslate.Heading>
              Select a case from the left to see details
            </Blankslate.Heading>
          </Blankslate>
        )}
      </Box>
    </Box>
  );
}
