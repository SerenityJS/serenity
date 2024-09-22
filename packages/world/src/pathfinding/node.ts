import type { Vector3f } from "@serenityjs/protocol";

class Node {
	public position: Vector3f;
	public gCost: number;
	public heuristic: number;
	public parent?: Node;
	public additionalPathCost: number;

	public constructor(position: Vector3f, parent?: Node) {
		this.position = position;
		this.gCost = 0;
		this.heuristic = 0;
		this.parent = parent;
		this.additionalPathCost = 0;
	}

	public get fCost(): number {
		return this.gCost + this.heuristic;
	}

	public equals(other: Node): boolean {
		return this.position.subtract(other.position).length() === 0;
	}

	public distanceManhattan(other: Node): number {
		const { x, y, z } = this.position.subtract(other.position).absolute();

		return x + y + z;
	}

	public updateCost(newCost: number): this {
		this.additionalPathCost = Math.max(this.additionalPathCost, newCost);
		return this;
	}
}

export { Node };
