import { Entity } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class EntityDropItemSignal extends EventSignal {
  public static readonly identifier = WorldEvent.EntityDropItem;

  /**
   * The entity that dropped the item.
   */
  public readonly source: Entity;

  /**
   * The item stack that was dropped.
   */
  public readonly itemStack: ItemStack;

  /**
   * The amount of items that were dropped.
   */
  public readonly amount: number;

  /**
   * The entity instance of the item stack.
   * This is only available in the after event hook.
   */
  public itemStackEntity: Entity | null = null;

  /**
   * Creates a new entity drop item signal.
   * @param source The entity that dropped the item.
   * @param itemStack The item stack that was dropped.
   * @param amount The amount of itemsource: Entitypped.
   */
  public constructor(source: Entity, itemStack: ItemStack, amount: number) {
    super(source.dimension.world);
    this.source = source;
    this.itemStack = itemStack;
    this.amount = amount;
  }
}

export { EntityDropItemSignal };
