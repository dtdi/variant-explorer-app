import { Box, Label, PageLayout, Truncate } from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { BookIcon } from "@primer/octicons-react";
import { ApiContext } from "../../main";
import { formatDuration } from "../../utils";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  const { rows, columns } = await axios
    .get(`${apiUrl}/aggregates/${aggregateId}/columns`)
    .then((res) => res.data);

  return { rows, columns };
}

export default function ColumnsPage() {
  const { columns, rows } = useLoaderData();
  const { workspace, aggregate, stats } = useContext(AggregateContext);
  const { apiUrl } = useContext(ApiContext);

  console.log(columns, rows);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap: 3,
      }}
    >
      <Table.Container>
        <Table.Title>Metadata</Table.Title>
        <Table.Subtitle>Overview of cases in the aggregate</Table.Subtitle>
        <DataTable data={rows} columns={columns} />
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
        <Blankslate spacious={true}>
          <Blankslate.Visual>
            <BookIcon size={"medium"} />
          </Blankslate.Visual>
          <Blankslate.Heading>
            Select a case from the left to see details
          </Blankslate.Heading>
        </Blankslate>
      </Box>
    </Box>
  );
}
