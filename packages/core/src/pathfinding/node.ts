import { IPosition, Vector3f } from "@serenityjs/protocol";

import { BinaryItem } from "./heap";

class Node extends Vector3f implements IPosition, BinaryItem {
  public gCost: number = 0;
  public heuristic: number = 0;
  public parent?: Node;

  public constructor(position: Vector3f, parent?: Node) {
    position = position.floor();

    super(position.x, position.y, position.z);
    this.parent = parent;
  }

  public get fCost(): number {
    return this.gCost + this.heuristic;
  }

  public distance(node: Node) {
    const distance = this.subtract(node).absolute();

    return distance.x + distance.y + distance.z;
  }

  public compareTo(other: Node): number {
    return this.fCost - other.fCost;
  }

  public static fromPosition(position: IPosition): Node {
    return new Node(new Vector3f(position.x, position.y, position.z));
  }
}
export { Node };
