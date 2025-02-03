import { Block } from "../../block";

interface EntityFallOnBlockTraitEvent {
  /**
   * The block that the entity fell on.
   */
  block: Block;

  /**
   * The distance that the entity fell.
   */
  fallDistance: number;

  /**
   * The amount of ticks that took place during the fall.
   */
  fallTicks: number;
}

export { EntityFallOnBlockTraitEvent };
