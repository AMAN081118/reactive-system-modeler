/**
 * Force-Directed Layout Engine for State Machines
 * Implements Fruchterman-Reingold algorithm for automatic node positioning
 * Ensures clean arrow alignment and minimizes visual clutter
 */

import { StateMachine, State } from "../models/types";

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  mass: number;
}

interface LayoutConfig {
  iterations: number; // Number of layout iterations
  k: number; // Optimal distance (spring constant)
  maxForce: number; // Maximum repulsive force
  friction: number; // Damping factor
  temperature: number; // Initial temperature for cooling
}

class LayoutEngine {
  private config: LayoutConfig;

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = {
      iterations: 50,
      k: 100,
      maxForce: 5,
      friction: 0.85,
      temperature: 10,
      ...config,
    };
  }

  /**
   * Calculate repulsive force between two nodes
   * Nodes push away from each other
   */
  private repulsiveForce(
    node1: LayoutNode,
    node2: LayoutNode,
    k: number,
  ): { fx: number; fy: number } {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 0.1; // Avoid division by zero

    const force = -(k * k) / distance;

    return {
      fx: (force * dx) / distance,
      fy: (force * dy) / distance,
    };
  }

  /**
   * Calculate attractive force between connected nodes
   * Connected nodes pull toward each other
   */
  private attractiveForce(
    node1: LayoutNode,
    node2: LayoutNode,
    k: number,
  ): { fx: number; fy: number } {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;

    const force = (distance * distance) / k;

    return {
      fx: (force * dx) / distance,
      fy: (force * dy) / distance,
    };
  }

  /**
   * Limit force magnitude to prevent instability
   */
  private limitForce(
    fx: number,
    fy: number,
    max: number,
  ): { fx: number; fy: number } {
    const magnitude = Math.sqrt(fx * fx + fy * fy);
    if (magnitude > max) {
      return {
        fx: (fx / magnitude) * max,
        fy: (fy / magnitude) * max,
      };
    }
    return { fx, fy };
  }

  /**
   * Main layout algorithm
   * Arranges nodes based on transition connectivity
   */
  compute(stateMachine: StateMachine): {
    [stateId: string]: { x: number; y: number };
  } {
    if (stateMachine.states.length === 0) {
      return {};
    }

    // Initialize layout nodes with current positions
    const nodes: LayoutNode[] = stateMachine.states.map((state) => ({
      id: state.id,
      x: state.position.x + 50,
      y: state.position.y + 50,
      vx: 0,
      vy: 0,
      mass: 1,
    }));

    // Build adjacency list for connected nodes
    const adjacency = new Map<string, Set<string>>();
    for (const node of nodes) {
      adjacency.set(node.id, new Set());
    }

    for (const transition of stateMachine.transitions) {
      const adj1 = adjacency.get(transition.from);
      const adj2 = adjacency.get(transition.to);
      if (adj1) adj1.add(transition.to);
      if (adj2 && transition.from !== transition.to) adj2.add(transition.from);
    }

    const { iterations, k, maxForce, friction, temperature } = this.config;

    // Iteratively compute forces and update positions
    for (let iter = 0; iter < iterations; iter++) {
      const coolingFactor = 1 - iter / iterations;
      const currentTemp = temperature * coolingFactor;

      // Reset forces
      for (const node of nodes) {
        node.vx = 0;
        node.vy = 0;
      }

      // Apply repulsive forces between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const force = this.repulsiveForce(nodes[i], nodes[j], k);
          let limited = this.limitForce(force.fx, force.fy, maxForce);

          nodes[i].vx += limited.fx;
          nodes[i].vy += limited.fy;
          nodes[j].vx -= limited.fx;
          nodes[j].vy -= limited.fy;
        }
      }

      // Apply attractive forces between connected nodes
      for (const [fromId, toIds] of adjacency) {
        const fromNode = nodes.find((n) => n.id === fromId)!;
        for (const toId of toIds) {
          const toNode = nodes.find((n) => n.id === toId)!;
          const force = this.attractiveForce(fromNode, toNode, k);
          let limited = this.limitForce(force.fx, force.fy, maxForce);

          fromNode.vx += limited.fx;
          fromNode.vy += limited.fy;
          toNode.vx -= limited.fx;
          toNode.vy -= limited.fy;
        }
      }

      // Update positions with velocity damping
      for (const node of nodes) {
        const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        const displacement = Math.min(velocity, currentTemp);

        if (velocity > 0) {
          node.x += (node.vx / velocity) * displacement;
          node.y += (node.vy / velocity) * displacement;
        }

        node.vx *= friction;
        node.vy *= friction;
      }
    }

    // Convert back to position format
    const result: { [stateId: string]: { x: number; y: number } } = {};
    for (const node of nodes) {
      result[node.id] = {
        x: node.x - 50,
        y: node.y - 50,
      };
    }

    return result;
  }

  /**
   * Apply layout to a state machine
   */
  applyLayout(stateMachine: StateMachine): StateMachine {
    const layout = this.compute(stateMachine);

    return {
      ...stateMachine,
      states: stateMachine.states.map((state) => ({
        ...state,
        position: layout[state.id] || state.position,
      })),
    };
  }
}

export default LayoutEngine;
