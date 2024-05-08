import { PageLayout } from "@primer/react";

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

export async function loader({ params }) {
  const processMap = {
    nodes: [
      {
        id: "1",
        data: { label: "Hello" },
        position: { x: 0, y: 0 },
        type: "input",
      },
      {
        id: "2",
        data: { label: "World" },
        position: { x: 0, y: 0 },
      },
      {
        id: "3",
        data: { label: "End" },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e1-3", source: "1", target: "3" },
      { id: "e1-1", source: "1", target: "1" },
    ],
  };
  return new Promise((resolve) => setTimeout(resolve({ processMap }), 300));
}

import { quadtree } from "d3-quadtree";
import { useMemo } from "react";

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

const LayoutFlow = () => {
  const [nodes, , onNodesChange] = useNodesState([
    {
      id: "Record Goods Receipt",
      data: { label: "Record Goods Receipt", value: 14697 },
      position: { x: 0, y: 0 },
    },
    {
      id: "▶",
      data: { label: "▶", value: 12000 },
      position: { x: 0, y: 20 },
      type: "input",
    },
    {
      id: "Create Purchase Order Item",
      data: { label: "Create Purchase Order Item", value: 12000 },
      position: { x: 0, y: 40 },
    },
    {
      id: "■",
      data: { label: "■", value: 12000 },
      position: { x: 0, y: 60 },
      type: "output",
    },
    {
      id: "Record Invoice Receipt",
      data: { label: "Record Invoice Receipt", value: 10866 },
      position: { x: 0, y: 80 },
    },
    {
      id: "Vendor creates invoice",
      data: { label: "Vendor creates invoice", value: 10423 },
      position: { x: 0, y: 100 },
    },
    {
      id: "Clear Invoice",
      data: { label: "Clear Invoice", value: 9254 },
      position: { x: 0, y: 120 },
    },
    {
      id: "Record Service Entry Sheet",
      data: { label: "Record Service Entry Sheet", value: 7534 },
      position: { x: 0, y: 140 },
    },
    {
      id: "Remove Payment Block",
      data: { label: "Remove Payment Block", value: 2740 },
      position: { x: 0, y: 160 },
    },
  ]);
  const [edges, , onEdgesChange] = useEdgesState([
    {
      id: "Clear Invoice-Record Invoice Receipt",
      source: "Clear Invoice",
      target: "Record Invoice Receipt",
    },
    { id: "Clear Invoice-■", source: "Clear Invoice", target: "■" },
    {
      id: "Create Purchase Order Item-Record Goods Receipt",
      source: "Create Purchase Order Item",
      target: "Record Goods Receipt",
    },
    {
      id: "Create Purchase Order Item-Vendor creates invoice",
      source: "Create Purchase Order Item",
      target: "Vendor creates invoice",
    },
    {
      id: "Create Purchase Order Item-■",
      source: "Create Purchase Order Item",
      target: "■",
    },
    {
      id: "Record Goods Receipt-Record Goods Receipt",
      source: "Record Goods Receipt",
      target: "Record Goods Receipt",
    },
    {
      id: "Record Goods Receipt-Record Invoice Receipt",
      source: "Record Goods Receipt",
      target: "Record Invoice Receipt",
    },
    {
      id: "Record Goods Receipt-Record Service Entry Sheet",
      source: "Record Goods Receipt",
      target: "Record Service Entry Sheet",
    },
    {
      id: "Record Goods Receipt-Remove Payment Block",
      source: "Record Goods Receipt",
      target: "Remove Payment Block",
    },
    {
      id: "Record Goods Receipt-Vendor creates invoice",
      source: "Record Goods Receipt",
      target: "Vendor creates invoice",
    },
    {
      id: "Record Goods Receipt-■",
      source: "Record Goods Receipt",
      target: "■",
    },
    {
      id: "Record Invoice Receipt-Clear Invoice",
      source: "Record Invoice Receipt",
      target: "Clear Invoice",
    },
    {
      id: "Record Invoice Receipt-Record Goods Receipt",
      source: "Record Invoice Receipt",
      target: "Record Goods Receipt",
    },
    {
      id: "Record Invoice Receipt-Record Invoice Receipt",
      source: "Record Invoice Receipt",
      target: "Record Invoice Receipt",
    },
    {
      id: "Record Invoice Receipt-Remove Payment Block",
      source: "Record Invoice Receipt",
      target: "Remove Payment Block",
    },
    {
      id: "Record Invoice Receipt-Vendor creates invoice",
      source: "Record Invoice Receipt",
      target: "Vendor creates invoice",
    },
    {
      id: "Record Invoice Receipt-■",
      source: "Record Invoice Receipt",
      target: "■",
    },
    {
      id: "Record Service Entry Sheet-Record Goods Receipt",
      source: "Record Service Entry Sheet",
      target: "Record Goods Receipt",
    },
    {
      id: "Record Service Entry Sheet-Record Service Entry Sheet",
      source: "Record Service Entry Sheet",
      target: "Record Service Entry Sheet",
    },
    {
      id: "Remove Payment Block-Clear Invoice",
      source: "Remove Payment Block",
      target: "Clear Invoice",
    },
    {
      id: "Remove Payment Block-■",
      source: "Remove Payment Block",
      target: "■",
    },
    {
      id: "Vendor creates invoice-Record Goods Receipt",
      source: "Vendor creates invoice",
      target: "Record Goods Receipt",
    },
    {
      id: "Vendor creates invoice-Record Invoice Receipt",
      source: "Vendor creates invoice",
      target: "Record Invoice Receipt",
    },
    {
      id: "▶-Create Purchase Order Item",
      source: "▶",
      target: "Create Purchase Order Item",
    },
    {
      id: "▶-Vendor creates invoice",
      source: "▶",
      target: "Vendor creates invoice",
    },
  ]);
  const [initialised, { toggle, isRunning }] = useLayoutedElements();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
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
  const { processMap } = useLoaderData();
  return (
    <PageLayout.Content sx={{ height: "400px" }}>
      <ReactFlowProvider>
        <LayoutFlow />
      </ReactFlowProvider>
    </PageLayout.Content>
  );
}
