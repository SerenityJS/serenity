import { Entity } from "../entity";

import { Node } from "./node";

abstract class NodeEvaluator {
  protected readonly entity: Entity;

  public constructor(entity: Entity) {
    this.entity = entity;
  }

  public abstract getNeighbors(node: Node): Array<Node>;
}

export { NodeEvaluator };
