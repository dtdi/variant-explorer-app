import { Box, Heading, Text } from "@primer/react";
import { formatDuration } from "../../utils";

export default function Base({ column }) {
  if (!column) {
    return null;
  }
  return (
    <Box
      className="shadow-sm"
      sx={{ bg: "canvas.inset", p: 3, borderRadius: 2 }}
    >
      <h5 className="">{column.display_name}</h5>
      <div className="d-flex justify-content-between">
        <span className="fw-medium">max:</span>
        <span>{formatDuration(column.stats.max)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-medium">mean:</span>
        <span>{formatDuration(column.stats.mean)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-medium">median:</span>
        <span>{formatDuration(column.stats.median)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-medium">min:</span>
        <span>{formatDuration(column.stats.min)}</span>
      </div>
    </Box>
  );
}
