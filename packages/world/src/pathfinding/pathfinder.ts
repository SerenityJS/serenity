import type { Node } from "./node";
import type { NodeEvaluator } from "./evaluators";

// A* algorithm implementation
class Pathfinder {
	// ? This sets contains all the nodes that aren't evaluated
	private openSet: Set<Node> = new Set<Node>();

	// ? This set contains all the nodes that have been evaluated
	private closedSet: Set<Node> = new Set<Node>();

	// ? The evaluator that will be used to evaluate each node
	private nodeEvaluator: NodeEvaluator;

	public constructor(evaluator: NodeEvaluator) {
		this.nodeEvaluator = evaluator;
	}

	/**
	 * Find the shortest path between a starting point and a target point
	 * @param startNode The starting point to start searching
	 * @param target The point we are trying to go.
	 * @param maxDistance The maximum search distance
	 * @returns The Path between the starting point and the target
	 */
	public findPath(
		startNode: Node,
		target: Node,
		maxDistance?: number
	): Array<Node> {
		// ? Compute the costs of the starting node
		startNode.gCost = 0;
		startNode.heuristic = startNode.distanceManhattan(target);

		// ? Add the starting node to the open set
		this.openSet.add(startNode);

		while (this.openSet.size > 0) {
			// ? Get the node with the lowest fCost from the open set and remove it from the open set.
			const currentNode = this.lowestCost();

			// ? Eslint fix
			if (!currentNode) break;

			// ? Delete the node from the open set, and add it to the closed set.
			this.openSet.delete(currentNode);
			this.closedSet.add(currentNode);

			// ? If a max search distance was provided, check if the ditance to the target position if greater than the limit.
			if (maxDistance && currentNode.distanceManhattan(target) > maxDistance)
				break;

			// ? If we are at the target point, stop looping and reconstruct the path
			if (currentNode.equals(target))
				return this.reconstructPath(currentNode, target);

			// ? Get every evaluated adjacent node from the current node.
			for (const neighbor of this.nodeEvaluator.getNeighbors(currentNode)) {
				// ? Check if the neighbor is the target point, and reconstruct the path
				if (currentNode.equals(target))
					return this.reconstructPath(currentNode, target);

				// ? If the neighbor is in the closed set, skip it.
				if (this.inClosedSet(neighbor)) continue;

				/* DBG: this.nodeEvaluator.entity.dimension
					.getBlock(neighbor.position)
					.setType(BlockType.get(BlockIdentifier.Bedrock)); */

				// ? Compute the cost based on the neighbor current cost and the distance to the currentNode
				const cost = neighbor.gCost + neighbor.distanceManhattan(currentNode);

				if (cost > neighbor.gCost && this.openSet.has(neighbor)) continue;
				// ? Check if the cost is smaller than the neighbor's cost or if the open set does not contain the neighbor
				// ? Then update the neighbor's costs, and assign the parent node.
				neighbor.gCost = cost;
				neighbor.heuristic = neighbor.distanceManhattan(target);
				neighbor.parent = currentNode;

				// ? If the neighbor is not in the open set, add it to the open set.
				if (!this.inOpenSet(neighbor)) this.openSet.add(neighbor);
			}
		}
		// ? If no path was found, return an empty path.
		return [];
	}

	private lowestCost(): Node | undefined {
		let lowestCostNode: Node | undefined;

		for (const node of this.openSet) {
			if (lowestCostNode === undefined || node.fCost < lowestCostNode.fCost) {
				lowestCostNode = node;
			}
		}
		return lowestCostNode;
	}

	private reconstructPath(currentNode: Node, end: Node): Array<Node> {
		// ? Create an empty path
		const path: Array<Node> = [];
		let current = currentNode;

		// ? Starting from the current node, go up the parent chain, adding each node to the beginning of the path array.
		while (current !== end) {
			if (!current.parent) break;
			path.unshift(current);
			current = current.parent;
		}

		return path;
	}

	private inClosedSet(node: Node): boolean {
		return [...this.closedSet].some((closedNode) => closedNode.equals(node));
	}

	private inOpenSet(node: Node): boolean {
		return [...this.openSet].some((openNode) => openNode.equals(node));
	}
}

export { Pathfinder };
