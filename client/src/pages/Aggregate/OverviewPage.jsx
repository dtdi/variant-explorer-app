import {
  ActionList,
  Box,
  BranchName,
  Button,
  CounterLabel,
  Heading,
  IconButton,
  Label,
  LabelGroup,
  SegmentedControl,
  Text,
} from "@primer/react";
import Markdown from "markdown-to-jsx";
import axios from "axios";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { AggregateContext } from "../../routes/AggregateRoot";
import { useContext, useEffect, useState } from "react";
import ColumnSplitter from "../../components/Splitter/ColumnSplitter";
import MultiColumnSplitter from "../../components/Splitter/MultiColumnSplitter";
import { formatDuration, formatNumber } from "../../utils";
import Base from "../../components/KPI/Base";
import BaseColumnBox from "../../components/ColumnBox/Base";

import Duration from "../../components/KPI/Duration";
import { Blankslate, DataTable, PageHeader, Table } from "@primer/react/drafts";
import { GitBranchIcon, PencilIcon } from "@primer/octicons-react";
import { GlobalContext } from "../../global-context";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  return { apiUrl };
}

export default function OverviewPage() {
  const { apiUrl, addToast, isLoading, setIsLoading } =
    useContext(GlobalContext);
  const { workspace, aggregate, stats, explanation } =
    useContext(AggregateContext);
  const revalidator = useRevalidator();

  const generateDescription = () => {
    setIsLoading(true);
    axios
      .post(`${apiUrl}/aggregates/editAggregate`, {
        workspace_id: workspace.id,
        aggregate_id: aggregate._identifier,
        ai_magic: true,
      })
      .then((res) => {
        addToast("Description generated", "generated a new description");
      })
      .finally(() => {
        setIsLoading(false);
        revalidator.revalidate();
      });
  };

  const [variantCounts, setVariantCounts] = useState({});

  useEffect(() => {
    setVariantCounts(
      aggregate.data.columns.find(
        (column) => column.event_log_column === "variant"
      )
    );
  }, [aggregate]);

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
        {aggregate.data.description ? (
          <p>
            <Markdown>{aggregate.data.description}</Markdown>
          </p>
        ) : (
          <p className={{ "placeholder-glow": isLoading }}>
            <span>Group description </span>
            <span className="placeholder col-7"></span>
            <span className="placeholder col-3"></span>
            <span className="placeholder col-6"></span>
            <span className="placeholder col-12"></span>
            <div>
              <Button disabled={isLoading} onClick={generateDescription}>
                generate
              </Button>
            </div>
          </p>
        )}

        <Duration column={getColumnByName("duration")} />
        <Base column={getColumnByName("length")} />
        <Duration column={getColumnByName("finish_rate")} />
        <Duration column={getColumnByName("sojourn_time")} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 3,
          mt: 3,
          mb: 3,
        }}
      >
        <Table.Container sx={{ mt: 3, mb: 3 }}>
          <Table.Title as="h2" id="shared-properties">
            Common Case Properties
          </Table.Title>
          <Table.Subtitle as="p" id="shared-properties-subtitle">
            These properties are shared amongst all cases.
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
      </Box>

      <Box sx={{ pt: 3, pb: 3 }}>
        <PageHeader>
          <PageHeader.TitleArea>
            <PageHeader.Title>Case Properties</PageHeader.Title>
            <PageHeader.Actions>
              <IconButton icon={GitBranchIcon} aria-label="Split" />
              <MultiColumnSplitter columns={aggregate.data.columns} />
            </PageHeader.Actions>
          </PageHeader.TitleArea>
        </PageHeader>
      </Box>

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
            <BaseColumnBox column={column} key={column.id} />
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
            <BaseColumnBox column={column} key={column.id} />
          ))}
      </Box>
    </>
  );
}
