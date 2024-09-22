import type { Entity } from "../../entity";
import type { Node } from "../node";

abstract class NodeEvaluator {
	public readonly entity: Entity;

	public constructor(entity: Entity) {
		this.entity = entity;
	}

	public abstract getNeighbors(node: Node): Array<Node>;
	public abstract evaluate(node: Node): boolean;
}

export { NodeEvaluator };
