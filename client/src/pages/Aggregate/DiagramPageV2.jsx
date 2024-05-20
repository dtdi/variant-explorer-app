import {
  Box,
  BranchName,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  Heading,
  PageLayout,
  Text,
  TextInput,
  ToggleSwitch,
} from "@primer/react";
import { Canvas, Node, Edge, Port, MarkerArrow } from "reaflow";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { ApiContext } from "../../main";

export default function ProcessMapPage() {
  const { apiUrl } = useContext(ApiContext);
  const { workspace, aggregate } = useContext(AggregateContext);
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activitiesSlider, setActivitiesSlider] = useState(0.04);
  const [pathsSlider, setPathsSlider] = useState(0.04);
  const [decoration, setDecoration] = useState("freq");
  const [frequencyMeasure, setFrequencyMeasure] = useState("noe");
  const [performanceMeasure, setPerformanceMeasure] = useState("noe");

  const updateDiagram = useCallback(() => {
    setNodes([]);
    setEdges([]);
    const diagramRequest = {
      workspace: workspace.id,
      aggregate: aggregate._identifier,
      activitiesSlider: activitiesSlider,
      pathsSlider: pathsSlider,
      decoration: decoration,
    };
    axios
      .post(`${apiUrl}/log/diagram`, diagramRequest)
      .then((res) => res.data)
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
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
          <Heading as="h4">Process Map Settings</Heading>
          <BranchName as="div">{workspace.name}</BranchName>
          <Text as="p">{workspace.description}</Text>
          <FormControl>
            <FormControl.Label>% Activities</FormControl.Label>
            <input
              type="range"
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
          </FormControl>
          <FormControl>
            <FormControl.Label>% Paths</FormControl.Label>
            <input
              type="range"
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
          </FormControl>

          <Button onClick={updateDiagram}>Update Diagram</Button>
          <Button
            onClick={() => {
              canvasRef.current.fitCanvas();
            }}
          >
            Fit Canvas
          </Button>

          <CheckboxGroup>
            <CheckboxGroup.Label>Decoration</CheckboxGroup.Label>
            <FormControl>
              <Checkbox value="Frequency" />
              <FormControl.Label>Frequency</FormControl.Label>
            </FormControl>
            <FormControl>
              <Checkbox value="Performance" />
              <FormControl.Label>Performance</FormControl.Label>
            </FormControl>
            <FormControl>
              <Checkbox value="CasePercentage" />
              <FormControl.Label>Case Percentage</FormControl.Label>
            </FormControl>
          </CheckboxGroup>
        </Box>
      </Box>
    </Box>
  );
}
