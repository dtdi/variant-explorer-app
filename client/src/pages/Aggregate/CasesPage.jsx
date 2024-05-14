import { Box, PageLayout } from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { BookIcon } from "@primer/octicons-react";
import { ApiContext } from "../../main";

export default function ProcessOverview() {
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const { apiUrl } = useContext(ApiContext);
  const [tableData, setTableData] = useState();
  const [cases, setCases] = useState();
  const [columns, setColumns] = useState();
  const [loading, setLoading] = useState(true);
  const [the_case, setCase] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    const request = {
      workspace_id: workspace.id,
      aggregate_id: aggregate._identifier,
      page: pageIndex,
      page_size: 10,
    };

    console.log(request);

    axios.post(`${apiUrl}/cases`, request).then((res) => {
      setCases(res.data.cases);
      setTableData(res.data.table_data);
      setColumns(res.data.columns);
      setLoading(false);
      setPageIndex(res.data.table_data.page);
    });
  }, [pageIndex]);

  const data = cases;

  if (loading) {
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
              pageIndex={pageIndex}
              onChange={({ pageIndex }) => {
                console.log(pageIndex);
              }}
              pageSize={tableData.page_size}
              totalCount={tableData.total}
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
