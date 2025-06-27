import { Entity, Player } from "../../entity";

interface ItemStackDroppedOptions {
  /**
   * The entity or player that dropped the item stack.
   */
  origin: Entity | Player;

  /**
   * The amount of the item stack that was dropped.
   */
  amount: number;

  /**
   * Whether the drop was or should be cancelled.
   */
  cancelled?: boolean;
}

export { ItemStackDroppedOptions };
