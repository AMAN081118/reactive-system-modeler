/**
 * FSM Graph Layout Engine (ELK.js version)
 * Provides clean, collision-free hierarchical layouts for state machines.
 */

import ELK, { ElkNode } from "elkjs";
import { StateMachine } from "../models/types";

interface LayoutResult {
  nodes: Map<string, { x: number; y: number; width: number; height: number }>;
  edges: {
    from: string;
    to: string;
    input?: string;
    output?: string;
    sections?: any[];
  }[];
}

class GraphLayoutEngine {
  private elk: any; // or private elk: typeof ELK;

  constructor() {
    this.elk = new ELK();
  }

  /**
   * Layout an FSM diagram using ELK layered algorithm.
   */
  public async layoutFSMDiagram(
    stateMachine: StateMachine,
  ): Promise<LayoutResult> {
    const defaultNodeWidth = 120;
    const defaultNodeHeight = 60;

    // Build ELK graph structure
    const elkGraph: ElkNode = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "80",
        "elk.layered.spacing.nodeNodeBetweenLayers": "120",
        "elk.layered.spacing.edgeEdgeBetweenLayers": "60",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
        "elk.edgeRouting": "SPLINES", // can use ORTHOGONAL for boxy look
        "elk.layered.crossingMinimization.semiInteractive": "true",
      },
      children: stateMachine.states.map((s) => ({
        id: s.id,
        width: defaultNodeWidth,
        height: defaultNodeHeight,
      })),
      edges: stateMachine.transitions.map((t, i) => ({
        id: `e${i}`,
        sources: [t.from],
        targets: [t.to],
        labels: [
          {
            text: t.input
              ? t.output
                ? `${t.input}/${t.output}`
                : `${t.input}`
              : "",
          },
        ],
      })),
    };

    // Run ELK layout
    const result = await this.elk.layout(elkGraph);

    // Extract positions
    const nodePositions = new Map<
      string,
      { x: number; y: number; width: number; height: number }
    >();
    if (result.children) {
      for (const node of result.children) {
        if (node.x !== undefined && node.y !== undefined) {
          nodePositions.set(node.id, {
            x: node.x,
            y: node.y,
            width: node.width ?? defaultNodeWidth,
            height: node.height ?? defaultNodeHeight,
          });
        }
      }
    }

    const edges = (result.edges || []).map((e: any) => ({
      from: e.sources?.[0] ?? "",
      to: e.targets?.[0] ?? "",
      sections: e.sections || [],
    }));

    return { nodes: nodePositions, edges };
  }
}

export const graphLayoutEngine = new GraphLayoutEngine();
