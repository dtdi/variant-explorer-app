import { Box, Heading, Text } from "@primer/react";
import { formatDuration, formatNumber } from "../../utils";
import * as d3 from "d3";
import { useEffect, useRef } from "react";
export default function Base({ column }) {
  if (!column) {
    return null;
  }
  const diagramRef = useRef(null);
  useEffect(() => {
    const elem = diagramRef.current;

    var q1 = parseFloat(column.stats.q1);
    var median = parseFloat(column.stats.median);
    var q3 = parseFloat(column.stats.q3);
    var interQuantileRange = q3 - q1;
    var min = q1 - 1.5 * interQuantileRange;
    var max = q1 + 1.5 * interQuantileRange;

    // Clear the existing content of the diagram element
    elem.innerHTML = "";

    // Set up the dimensions and margins of the diagram
    const width = elem.offsetWidth || 300;
    const height = 60;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3
      .select(elem)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create the scales for the x-axis and y-axis
    const xScale = d3
      .scaleLinear()
      .domain([min, max])
      .range([margin.left, innerWidth + margin.left]);

    console.log(xScale(1));

    // Create the boxplot
    svg
      .append("rect")
      .attr("x", xScale(q1))
      .attr("y", margin.top)
      .attr("width", xScale(q3) - xScale(q1))
      .attr("height", innerHeight)
      .attr("fill", "lightblue");

    svg
      .append("line")
      .attr("x1", xScale(min))
      .attr("y1", margin.top + innerHeight / 2)
      .attr("x2", xScale(max))
      .attr("y2", margin.top + innerHeight / 2)
      .attr("stroke", "black");

    svg
      .selectAll("circle")
      .data([min, max])
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d))
      .attr("cy", margin.top + innerHeight / 2)
      .attr("r", 3)
      .attr("fill", "black");

    svg
      .selectAll("line")
      .data([q1, median, q3])
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d))
      .attr("y1", margin.top)
      .attr("x2", (d) => xScale(d))
      .attr("y2", margin.top + innerHeight)
      .attr("stroke", "black");

    // Add labels
    svg
      .append("text")
      .attr("x", xScale(min))
      .attr("y", margin.top + innerHeight + margin.bottom / 2)
      .text(formatNumber(min))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("x", xScale(max))
      .attr("y", margin.top + innerHeight + margin.bottom / 2)
      .text(formatNumber(max))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("x", xScale(q1))
      .attr("y", margin.top - 5)
      .text(formatNumber(q1))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("x", xScale(median))
      .attr("y", margin.top - 5)
      .text(formatNumber(median))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");

    svg
      .append("text")
      .attr("x", xScale(q3))
      .attr("y", margin.top - 5)
      .text(formatNumber(q3))
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
  }, [column]);

  return (
    <Box
      className="shadow-sm"
      sx={{ bg: "canvas.inset", p: 3, borderRadius: 2 }}
    >
      <div
        style={{ fontSize: "16px", lineHeight: 1.1, fontWeight: 600 }}
        className=""
      >
        {column.display_name}
      </div>
      <div className="d-flex justify-content-between">
        <span style={{ fontSize: "14px" }} className="fw-medium">
          median:
        </span>
        <span>{formatNumber(column.stats.median)}</span>
      </div>
      <div
        style={{ fontSize: "12px" }}
        className="d-flex justify-content-between"
      >
        <span className="fw-medium">max:</span>
        <span>{formatNumber(column.stats.max)}</span>
      </div>
      <div
        style={{ fontSize: "12px" }}
        className="d-flex justify-content-between"
      >
        <span className="fw-medium">mean:</span>
        <span>{formatNumber(column.stats.mean)}</span>
      </div>

      <div
        style={{ fontSize: "12px" }}
        className="d-flex justify-content-between"
      >
        <span className="fw-medium">min:</span>
        <span>{formatNumber(column.stats.min)}</span>
      </div>

      <div ref={diagramRef}></div>
    </Box>
  );
}
