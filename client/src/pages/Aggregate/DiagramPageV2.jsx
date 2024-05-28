import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  SegmentedControl,
  Select,
  TextInput,
} from "@primer/react";
import { Canvas, Node, Edge, Port, MarkerArrow, Label } from "reaflow";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { GlobalContext } from "../../global-context";
import { BugIcon } from "@primer/octicons-react";

export default function ProcessMapPage() {
  const { apiUrl } = useContext(GlobalContext);
  const { workspace, aggregate } = useContext(AggregateContext);
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activitiesSlider, setActivitiesSlider] = useState(0.1);
  const [pathsSlider, setPathsSlider] = useState(0.1);
  const [decoration, setDecoration] = useState("perf");
  const [frequencyMeasure, setFrequencyMeasure] = useState("noe");
  const [performanceMeasure, setPerformanceMeasure] = useState("mean");

  const updateDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const diagramRequest = {
      workspace: workspace.id,
      aggregate: aggregate._identifier,
      activitiesSlider: activitiesSlider,
      pathsSlider: pathsSlider,
      decoration: decoration,
      performanceAgg: performanceMeasure,
      frequencyMeasure: frequencyMeasure,
    };
    axios
      .post(`${apiUrl}/log/diagram`, diagramRequest)
      .then((res) => res.data)
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        canvasRef.current.fitCanvas();
      });
  }, [
    apiUrl,
    workspace,
    aggregate,
    activitiesSlider,
    pathsSlider,
    decoration,
    frequencyMeasure,
    performanceMeasure,
  ]);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap: 3,
      }}
    >
      <Box
        sx={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "border.default",
          borderRadius: 2,
        }}
      >
        <Canvas
          animated={true}
          width={"100%"}
          maxHeight={5000}
          maxWidth={5000}
          height={600}
          node={
            <Node label={null} style={{ fill: "var(--bs-secondary-bg)" }}>
              {(event) => (
                <foreignObject
                  height={event.height}
                  width={event.width}
                  x={0}
                  y={0}
                >
                  <div className="p-1 text-center">
                    <div
                      className="fw-medium"
                      style={{
                        color: "var(--bs-body-color)",
                        fontSize: "small",
                      }}
                    >
                      {event.node.text}
                    </div>
                    <div
                      style={{
                        color: "var(--bs-body-color)",
                        fontSize: "smaller",
                      }}
                      className="fw-normal"
                    >
                      {event.node.data.value}
                    </div>
                  </div>
                </foreignObject>
              )}
            </Node>
          }
          edge={
            <Edge
              label={
                <Label
                  style={{ fill: "var(--bs-body-color)" }}
                  className="fw-medium"
                />
              }
            />
          }
          nodes={nodes}
          edges={edges}
          fit
          direction="DOWN"
          pannable={true}
          zoomable={true}
          readonly={true}
          ref={canvasRef}
        />
      </Box>
      <Box
        sx={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "border.default",
          borderRadius: 2,
          p: 3,
          bg: "canvas.default",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <h4>Process Map Settings</h4>
          <FormControl>
            <FormControl.Label for="activitesSlider">
              % Activities
            </FormControl.Label>
            <div className="d-flex align-items-center">
              <input
                type="range"
                id="activitesSlider"
                className="form-range flex-grow-1 me-3"
                value={activitiesSlider}
                onChange={(e) => {
                  setActivitiesSlider(e.target.value);
                }}
                min="0"
                max="1"
                step="0.01"
              />
              <TextInput
                monospace
                value={activitiesSlider}
                onChange={(e) => {
                  setActivitiesSlider(e.target.value);
                }}
              />
            </div>
          </FormControl>
          <FormControl>
            <FormControl.Label>% Paths</FormControl.Label>
            <div className="d-flex align-items-center">
              <input
                type="range"
                className="form-range flex-grow-1 me-3"
                value={pathsSlider}
                onChange={(e) => {
                  setPathsSlider(e.target.value);
                }}
                min="0"
                max="1"
                step="0.01"
              />
              <TextInput
                monospace
                value={pathsSlider}
                onChange={(e) => {
                  setPathsSlider(e.target.value);
                }}
              />
            </div>
          </FormControl>

          <SegmentedControl
            fullWidth
            onChange={(i) => {
              const decorations = ["freq", "perf"];
              setDecoration(decorations[i]);
            }}
            aria-label="Decoration"
            sx={{ mt: 3, mb: 3 }}
          >
            <SegmentedControl.Button selected={decoration == "freq"}>
              Frequency
            </SegmentedControl.Button>
            <SegmentedControl.Button selected={decoration == "perf"}>
              Performance
            </SegmentedControl.Button>
          </SegmentedControl>

          {decoration == "freq" && (
            <FormControl>
              <FormControl.Label>Frequency Measure</FormControl.Label>
              <Select
                block
                onChange={(e) => {
                  setFrequencyMeasure(e.target.value);
                }}
                aria-label="Frequency Measure"
              >
                <Select.Option value={"noe"}>Number of Events</Select.Option>
                <Select.Option value={"noc"}>Number of Cases</Select.Option>
              </Select>
            </FormControl>
          )}

          {decoration == "perf" && (
            <FormControl>
              <FormControl.Label>Performance Measure</FormControl.Label>
              <Select
                block
                onChange={(e) => {
                  setPerformanceMeasure(e.target.value);
                }}
                aria-label="Performance Measure"
              >
                <Select.Option value={"mean"}>Mean of Times</Select.Option>
                <Select.Option value={"median"}>Median of Times</Select.Option>
                <Select.Option value={"max"}>Maximum Time</Select.Option>
                <Select.Option value={"min"}>Minimum Time</Select.Option>
              </Select>
            </FormControl>
          )}
          <ButtonGroup sx={{ mt: 2 }}>
            <Button variant="primary" onClick={updateDiagram}>
              Update Diagram
            </Button>
            <Button
              onClick={() => {
                canvasRef.current.fitCanvas();
              }}
            >
              Fit Canvas
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}
