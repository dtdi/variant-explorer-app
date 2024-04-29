import { PageLayout } from "@primer/react";

import { useLoaderData } from "react-router-dom";

import ReactFlow, { Background, Controls } from "reactflow";

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
        position: { x: 100, y: 100 },
      },
      {
        id: "3",
        data: { label: "End" },
        position: { x: 200, y: 100 },
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

export default function ProcessMapPage() {
  const { processMap } = useLoaderData();
  return (
    <PageLayout.Content sx={{ height: "400px" }}>
      <ReactFlow edges={processMap.edges} nodes={processMap.nodes} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </PageLayout.Content>
  );
}
