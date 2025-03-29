import { Block } from "..";
import { Entity } from "../entity";

import { Node } from "./node";

abstract class NodeEvaluator {
  public readonly entity: Entity;

  public constructor(entity: Entity) {
    this.entity = entity;
  }

  public abstract getNeighbors(node: Node): Generator<Node>;

  protected async getBlock(node: Node): Promise<Block> {
    return this.entity.dimension.getBlock(node);
  }
}

export { NodeEvaluator };
