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

import { useLoaderData } from "react-router-dom";

import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceX,
  forceY,
} from "d3-force";

import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
} from "reactflow";

import "reactflow/dist/style.css";

export async function action({ params }) {}

import { quadtree } from "d3-quadtree";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AggregateContext } from "../../routes/AggregateRoot";
import axios from "axios";
import { GlobalContext } from "../../global-context";

const collide = function () {
  let nodes = [];
  let force = (alpha) => {
    const tree = quadtree(
      nodes,
      (d) => d.x,
      (d) => d.y
    );

    for (const node of nodes) {
      const r = node.width / 2;
      const nx1 = node.x - r;
      const nx2 = node.x + r;
      const ny1 = node.y - r;
      const ny2 = node.y + r;

      tree.visit((quad, x1, y1, x2, y2) => {
        if (!quad.length) {
          do {
            if (quad.data !== node) {
              const r = node.width / 2 + quad.data.width / 2;
              let x = node.x - quad.data.x;
              let y = node.y - quad.data.y;
              let l = Math.hypot(x, y);

              if (l < r) {
                l = ((l - r) / l) * alpha;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.data.x += x;
                quad.data.y += y;
              }
            }
          } while ((quad = quad.next));
        }

        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    }
  };

  force.initialize = (newNodes) => (nodes = newNodes);

  return force;
};

const simulation = forceSimulation()
  .force("charge", forceManyBody().strength(-1000))
  .force("x", forceX().x(0).strength(0.05))
  .force("y", forceY().y(0).strength(0.05))
  .force("collide", collide())
  .alphaTarget(0.05)
  .stop();

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
  const initialised = useStore((store) =>
    [...store.nodeInternals.values()].every((node) => node.width && node.height)
  );

  return useMemo(() => {
    let nodes = getNodes().map((node) => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
    }));
    let edges = getEdges().map((edge) => edge);
    let running = false;

    // If React Flow hasn't initialised our nodes with a width and height yet, or
    // if there are no nodes in the flow, then we can't run the simulation!
    if (!initialised || nodes.length === 0) return [false, {}];

    simulation.nodes(nodes).force(
      "link",
      forceLink(edges)
        .id((d) => d.id)
        .strength(0.05)
        .distance(100)
    );

    // The tick function is called every animation frame while the simulation is
    // running and progresses the simulation one step forward each time.
    const tick = () => {
      getNodes().forEach((node, i) => {
        const dragging = Boolean(
          document.querySelector(`[data-id="${node.id}"].dragging`)
        );

        // Setting the fx/fy properties of a node tells the simulation to "fix"
        // the node at that position and ignore any forces that would normally
        // cause it to move.
        nodes[i].fx = dragging ? node.position.x : null;
        nodes[i].fy = dragging ? node.position.y : null;
      });

      simulation.tick();
      setNodes(
        nodes.map((node) => ({ ...node, position: { x: node.x, y: node.y } }))
      );

      window.requestAnimationFrame(() => {
        // Give React and React Flow a chance to update and render the new node
        // positions before we fit the viewport to the new layout.
        fitView();

        // If the simulation hasn't be stopped, schedule another tick.
        if (running) tick();
      });
    };

    const toggle = () => {
      running = !running;
      running && window.requestAnimationFrame(tick);
    };

    const isRunning = () => running;

    return [true, { toggle, isRunning }];
  }, [initialised]);
};

const LayoutFlow = ({ n, e }) => {
  const [nodes, , onNodesChange] = useNodesState(n);
  const [edges, , onEdgesChange] = useEdgesState(e);
  const [initialised, { toggle, isRunning }] = useLayoutedElements();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background />
      <Controls />
      <Panel>
        {initialised && (
          <button onClick={toggle}>
            {isRunning() ? "Stop" : "Start"} force simulation
          </button>
        )}
      </Panel>
    </ReactFlow>
  );
};

export default function ProcessMapPage() {
  const { apiUrl } = useContext(GlobalContext);
  const { workspace, aggregate } = useContext(AggregateContext);

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
    <Box sx={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 3 }}>
      <Box
        sx={{
          height: 600,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "border.default",
          borderRadius: 2,
        }}
      >
        {nodes.length > 0 && edges.length > 0 && (
          <ReactFlowProvider>
            <LayoutFlow n={nodes} e={edges} />
          </ReactFlowProvider>
        )}
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
            <TextInput
              monospace
              value={pathsSlider}
              onChange={(e) => {
                setPathsSlider(e.target.value);
              }}
            />
          </FormControl>

          <Button onClick={updateDiagram}>Update Diagram</Button>

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
