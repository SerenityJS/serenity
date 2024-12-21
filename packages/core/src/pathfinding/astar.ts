import { NodeEvaluator } from "./evaluator";
import { BinaryHeap } from "./heap";
import { Node } from "./node";

// ? A* implementation
class Astar {
  private openSet: BinaryHeap<Node>;

  private closedSet: Set<Node>;

  private nodeEvaluator: NodeEvaluator;

  public constructor(evaluator: NodeEvaluator) {
    this.openSet = new BinaryHeap();
    this.closedSet = new Set();
    this.nodeEvaluator = evaluator;
  }

  public findPath(start: Node, target: Node, maxDistance: number): Array<Node> {
    const starTime = Date.now();
    start.gCost = 0;
    start.heuristic = start.distance(target);

    this.openSet.insert(start);

    while (this.openSet.size > 0) {
      if (Date.now() - starTime > 10_000) break;
      const currentNode = this.openSet.pop()!;
      this.closedSet.add(currentNode);

      if (maxDistance && currentNode.distance(target) > maxDistance) break;
      if (currentNode.equals(target)) {
        return this.reconstructPath(currentNode, target);
      }

      for (const neighbor of this.nodeEvaluator.getNeighbors(currentNode)) {
        if (this.inSet(this.closedSet, neighbor)) continue;
        const cost = neighbor.gCost + neighbor.distance(currentNode);

        if (
          cost > neighbor.gCost &&
          this.openSet.has(this.nodePredicate(neighbor))
        )
          continue;
        neighbor.gCost = cost;
        neighbor.heuristic = neighbor.distance(target);
        neighbor.parent = currentNode;

        if (!this.openSet.has(this.nodePredicate(neighbor)))
          this.openSet.insert(neighbor);
      }
    }
    return [];
  }

  private reconstructPath(currentNode: Node, end: Node): Array<Node> {
    const path: Array<Node> = [];
    let current = currentNode;

    while (current !== end) {
      if (!current.parent) break;
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }

  private nodePredicate(node: Node): (node: Node) => boolean {
    return (savedNode: Node) => node.equals(savedNode);
  }

  private inSet(set: Set<Node>, node: Node): boolean {
    return [...set.values()].some(this.nodePredicate(node));
  }
}

export { Astar };
