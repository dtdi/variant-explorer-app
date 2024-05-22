import {
  ActionList,
  Box,
  BranchName,
  CounterLabel,
  Heading,
  IconButton,
  Label,
  LabelGroup,
  SegmentedControl,
  Text,
} from "@primer/react";
import axios from "axios";
import { useLoaderData } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useContext } from "react";
import ColumnSplitter from "../../components/Splitter/ColumnSplitter";
import MultiColumnSplitter from "../../components/Splitter/MultiColumnSplitter";
import { formatDuration, formatNumber } from "../../utils";
import Base from "../../components/KPI/Base";
import Duration from "../../components/KPI/Duration";
import { DataTable, PageHeader, Table } from "@primer/react/drafts";
import { GitBranchIcon, PencilIcon } from "@primer/octicons-react";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  return { apiUrl };
}

export default function OverviewPage() {
  const { apiUrl } = useLoaderData();
  const { workspace, aggregate, stats, explanation } =
    useContext(AggregateContext);

  const getColumnByName = (name) => {
    const column = aggregate.data.columns.find(
      (column) => column.event_log_column === name
    );
    return column;
  };

  return (
    <>
      {/* event log columns with <= 1 values => explain */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 3,
          mt: 3,
          mb: 3,
        }}
      >
        {" "}
        <p>{aggregate.data.description} asdfasdf</p>
        <Duration column={getColumnByName("duration")} />
        <Base column={getColumnByName("length")} />
        <Duration column={getColumnByName("finish_rate")} />
        <Duration column={getColumnByName("sojourn_time")} />
      </Box>
      <Table.Container sx={{ mt: 3, mb: 3 }}>
        <Table.Title as="h2" id="shared-properties">
          Shared Properties
        </Table.Title>
        <Table.Subtitle as="p" id="shared-properties-subtitle">
          These properties are shared by all cases in the group.
        </Table.Subtitle>
        <DataTable
          cellPadding="condensed"
          columns={[
            { header: "Property", rowHeader: true, field: "display_name" },
            { header: "Value", field: "value" },
          ]}
          data={explanation?.final_columns.map((col) => col.value) || []}
        />
      </Table.Container>
      {/* event log columns with > 1 values */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {aggregate.data.columns
          .filter(
            (column) =>
              column.visible &&
              column.event_log_column &&
              column.distinct_values > 1
          )
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
              <h6>{column.display_name}</h6>
              <p>{column.description}</p>
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
              <ColumnSplitter column={column} />

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
                </Table.Container>
              )}
            </Box>
          ))}
      </Box>
      {/* non event log columns with > 1 values => split potnetial */}
      <Box sx={{ pt: 3, pb: 3 }}>
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title>
              Explore and further refine your group
            </PageHeader.Title>
            <PageHeader.Actions>
              <IconButton icon={GitBranchIcon} aria-label="Split" />
              <MultiColumnSplitter columns={aggregate.data.columns} />
            </PageHeader.Actions>
          </PageHeader.TitleArea>
        </PageHeader>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {aggregate.data.columns
          .filter(
            (column) =>
              column.visible &
              !column.event_log_column &
              (column.distinct_values > 1)
          )
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
              <h6 className="fs-6">{column.display_name}</h6>
              <p>{column.description}</p>

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
              <ColumnSplitter column={column} />

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
                </Table.Container>
              )}
            </Box>
          ))}
      </Box>
    </>
  );
}
