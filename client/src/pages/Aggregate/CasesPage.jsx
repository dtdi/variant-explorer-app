import { Box, Label, PageLayout, Truncate } from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { BookIcon } from "@primer/octicons-react";
import { GlobalContext } from "../../global-context";
import { formatDuration } from "../../utils";

export default function ProcessOverview() {
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const { apiUrl } = useContext(GlobalContext);
  const [tableData, setTableData] = useState({});
  const [cases, setCases] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [the_case, setCase] = useState(null);
  const [pidx, setPageIndex] = useState(0);

  const transformColumns = (columns) => {
    return columns.map((column) => {
      if (column.display_as === "badge") {
        column.renderCell = (value) => {
          const valueText = value[column.field].toString();

          return <Label>{valueText}</Label>;
        };
      } else if (column.display_as === "text") {
        column.renderCell = (value) => {
          const valueText = value[column.field].toString();
          return (
            <Truncate maxWidth={150} inline expandable>
              {valueText}
            </Truncate>
          );
        };
      } else if (column.display_as === "duration") {
        column.renderCell = (value) => {
          const seconds = value[column.field];
          return formatDuration(seconds);
        };
      }
      return column;
    });
  };

  const DEFAULT_PAGE_SIZE = 15;

  useEffect(() => {
    setLoading(true);
    const request = {
      workspace_id: workspace.id,
      aggregate_id: aggregate._identifier,
      page: pidx,
      page_size: DEFAULT_PAGE_SIZE,
    };

    axios.post(`${apiUrl}/cases`, request).then((res) => {
      setCases(res.data.cases);
      setTableData(res.data.table_data);

      setColumns(transformColumns(res.data.columns));

      setLoading(false);
    });
  }, [pidx]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: 3,
      }}
    >
      <Table.Container>
        <Table.Title>Cases</Table.Title>
        <Table.Subtitle>Overview of cases in the aggregate</Table.Subtitle>
        {loading && (
          <Table.Skeleton
            rows={DEFAULT_PAGE_SIZE}
            columns={[
              {
                header: "Case ID",
                field: "1",
                align: "start",
                display_as: "text",
                rowHeader: true,
              },

              {
                header: "Case:@@start Time",
                field: "26",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },

              {
                header: "Case:@@arrival Rate",
                field: "6",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },

              {
                header: "Case:@@waiting Time",
                field: "8",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },
              {
                header: "Case:@@sojourn Time",
                field: "9",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },
              {
                header: "Case:@@diff Start End",
                field: "10",
                align: "end",
                display_as: "badge",
                rowHeader: false,
              },

              {
                header: "Case:@@service Time",
                field: "16",
                align: "end",
                display_as: "badge",
                rowHeader: false,
              },

              {
                header: "Case:@@finish Rate",
                field: "21",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },

              {
                header: "Case:##len",
                field: "24",
                align: "end",
                display_as: "badge",
                rowHeader: false,
              },
              {
                header: "Case:@@end Time",
                field: "27",
                align: "end",
                display_as: "text",
                rowHeader: false,
              },
            ]}
          />
        )}
        {!loading && <DataTable data={cases} columns={columns} />}
        <Table.Pagination
          id="cases-pagination"
          aria-label="Pagination for Cases"
          defaultPageIndex={0}
          onChange={({ pageIndex }) => {
            setPageIndex(pageIndex);
          }}
          pageSize={tableData?.page_size || DEFAULT_PAGE_SIZE}
          totalCount={tableData?.total || 100}
        />
      </Table.Container>
    </Box>
  );
}
