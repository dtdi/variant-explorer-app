import { Box, BranchName, Label, LabelGroup, Text, Token } from "@primer/react";
import ColumnSplitter from "../Splitter/ColumnSplitter";
import { DataTable, Table } from "@primer/react/drafts";
import { formatDuration, formatNumber } from "../../utils";

export default function ({ column }) {
  return (
    <Box
      sx={{
        p: 3,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 2,
        borderColor: "border.default",
      }}
      key={column.name}
    >
      <div className="d-flex justify-content-between align-items-center">
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {column.display_name}
        </Text>

        <LabelGroup>
          <Label>{column.column_type}</Label>
          {column.missing_values > 0 && (
            <Label variant="danger">{column.missing_values} missing</Label>
          )}
        </LabelGroup>
        <ColumnSplitter column={column} />
      </div>
      {column.description && (
        <Text sx={{ fontSize: 0, color: "fg.muted", lineHeight: 1 }}>
          {column.description}
        </Text>
      )}
      {column.stats && (
        <Box sx={{ fontSize: 0 }}>
          <Text sx={{ color: "fg.muted", fontWeight: "bold" }}>Stats: </Text>
          <Text>
            <BranchName sx={{ mr: 1 }}>
              Min:{" "}
              {column.column_type == "TimedeltaColumn"
                ? formatDuration(column.stats.min)
                : formatNumber(column.stats.min)}
            </BranchName>
            <BranchName sx={{ mr: 1 }}>
              Max:{" "}
              {column.column_type == "TimedeltaColumn"
                ? formatDuration(column.stats.max)
                : formatNumber(column.stats.max)}
            </BranchName>
            <BranchName sx={{ mr: 1 }}>
              Mean:{" "}
              {column.column_type == "TimedeltaColumn"
                ? formatDuration(column.stats.mean)
                : formatNumber(column.stats.mean)}
            </BranchName>
            <BranchName>
              Median:{" "}
              {column.column_type == "TimedeltaColumn"
                ? formatDuration(column.stats.median)
                : formatNumber(column.stats.median)}
            </BranchName>
          </Text>
        </Box>
      )}
      {!column.value_dict && (
        <Box sx={{ fontSize: 0 }}>
          <Text sx={{ color: "fg.muted", fontWeight: "bold" }}>Values: </Text>
          {!column.value_dict &&
            column.head &&
            column.head
              .map((elem) => {
                if (column.column_type == "TimedeltaColumn") {
                  return formatDuration(elem);
                }
                if (column.column_type == "NumericColum") {
                  return formatNumber(elem);
                }
                return elem;
              })
              .join(", ") + " ..."}
        </Box>
      )}
      {column.value_dict && (
        <Table.Container sx={{ mt: 2 }}>
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
            data={Object.entries(column.value_dict).map(([key, value]) => ({
              name: key,
              count: value,
              key: key,
            }))}
          />
        </Table.Container>
      )}
    </Box>
  );
}
