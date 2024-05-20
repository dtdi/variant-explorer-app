import {
  ActionList,
  Box,
  BranchName,
  CounterLabel,
  Heading,
  Label,
  LabelGroup,
  SegmentedControl,
  Text,
} from "@primer/react";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useContext } from "react";
import GroupBySplitterComponent from "../../components/Splitter/GroupBySplitterComponent";
import Base from "../../components/KPI/Base";
import { EyeIcon, FileCodeIcon, PeopleIcon } from "@primer/octicons-react";
import { DataTable, Table } from "@primer/react/drafts";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  return { apiUrl };
}

export default function OverviewPage() {
  const { apiUrl } = useLoaderData();
  const { workspace, aggregate, stats } = useContext(AggregateContext);

  console.log(aggregate);

  return (
    <>
      <Heading>Aggregate {aggregate.data.name}</Heading>
      <SegmentedControl size="medium" fullWidth aria-label="Performance Aspect">
        <SegmentedControl.Button aria-label={"Preview"} leadingIcon={EyeIcon}>
          Performance
        </SegmentedControl.Button>
        <SegmentedControl.Button aria-label={"Raw"} leadingIcon={FileCodeIcon}>
          Compliance
        </SegmentedControl.Button>
        <SegmentedControl.Button aria-label={"Blame"} leadingIcon={PeopleIcon}>
          Data Quality
        </SegmentedControl.Button>
      </SegmentedControl>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 3,
          mt: 3,
          mb: 3,
        }}
      >
        <Base aggregate={aggregate} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
        {aggregate.data.columns
          .sort((a, b) => a.distinct_values - b.distinct_values)
          .map((column) => (
            <Box
              sx={{
                p: 3,
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 2,
                borderColor: "border.default",
              }}
              key={column.id}
            >
              <Heading sx={{ fontSize: 1 }} as="h4">
                {column.display_name}
              </Heading>
              {column.description}

              <LabelGroup>
                <Label>{column.distinct_values} distinct</Label>
                {column.missing_values > 0 && (
                  <Label variant="danger">
                    {column.missing_values} missing
                  </Label>
                )}
                {column.event_log_column && (
                  <Label variant="secondary">{column.event_log_column}</Label>
                )}
              </LabelGroup>
              <GroupBySplitterComponent column={column} />

              <Box sx={{ fontSize: 0 }}>{column.description}</Box>
              {!column.value_dict && (
                <Box sx={{ fontSize: 0 }}>
                  <Text sx={{ color: "fg.muted", fontWeight: "bold" }}>
                    Values:{" "}
                  </Text>
                  {!column.value_dict &&
                    column.head &&
                    column.head.join(", ") + "..."}
                </Box>
              )}
              {column.value_dict && (
                <Table.Container>
                  <DataTable
                    cellPadding="condensed"
                    aria-label="Values"
                    columns={[
                      { field: "name", header: "Value", rowHeader: true },
                      {
                        field: "count",
                        header: "Count",
                        align: "end",
                        sortBy: "basic",
                      },
                    ]}
                    data={Object.entries(column.value_dict).map(
                      ([key, value]) => ({ name: key, count: value })
                    )}
                  />
                  {column.value_dict &&
                    Object.entries(column.value_dict).length > 10 && (
                      <Table.Pagination
                        aria-label="Pagination for Repositories"
                        pageSize={10}
                        totalCount={Object.entries(column.value_dict).length}
                      />
                    )}
                </Table.Container>
              )}
            </Box>
          ))}
      </Box>
    </>
  );
}
