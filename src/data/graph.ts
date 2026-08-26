import graphJson from "./generated/graph.json";
import type { GraphEdge, GraphNode } from "@/types/portfolio";

export const graphNodes = graphJson.nodes as GraphNode[];
export const graphEdges = graphJson.edges as GraphEdge[];

export const graphNodesById = Object.fromEntries(
  graphNodes.map((node) => [node.id, node]),
) as Record<string, GraphNode>;
