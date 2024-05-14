import { Box, Label, PageLayout } from "@primer/react";
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
  const [pidx, setPageIndex] = useState(0);

  const transformColumns = (columns) => {
    return columns.map((column) => {
      if (column.display_as === "badge") {
        column.renderCell = (value) => {
          return <Label>{value[column.field]}</Label>;
        };
      }
      return column;
    });
  };

  useEffect(() => {
    setLoading(true);
    const request = {
      workspace_id: workspace.id,
      aggregate_id: aggregate._identifier,
      page: pidx,
      page_size: 10,
    };

    axios.post(`${apiUrl}/cases`, request).then((res) => {
      setCases(res.data.cases);
      setTableData(res.data.table_data);

      setColumns(transformColumns(res.data.columns));

      setLoading(false);
    });
  }, [pidx]);

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
        <DataTable data={cases} columns={columns} />
        <Table.Pagination
          id="cases-pagination"
          aria-label="Pagination for Cases"
          defaultPageIndex={0}
          onChange={({ pageIndex }) => {
            setPageIndex(pageIndex);
          }}
          pageSize={tableData.page_size}
          totalCount={tableData.total}
        />
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
