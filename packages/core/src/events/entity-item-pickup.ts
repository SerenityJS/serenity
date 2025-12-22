import { ItemStack } from "../item";
import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityItemPickupSignal extends EventSignal {
  public static readonly identifier = WorldEvent.EntityItemPickup;

  /**
   * The entity that picked up the item.
   */
  public readonly source: Entity;

  /**
   * The item stack that was picked up.
   */
  public readonly itemStack: ItemStack;

  /**
   * Creates a new entity item signal.
   * @param source The entity that picked up the item.
   * @param itemStack The item stack that was picked up.
   */
  public constructor(source: Entity, itemStack: ItemStack) {
    super(source.dimension.world);
    this.source = source;
    this.itemStack = itemStack;
  }
}

export { EntityItemPickupSignal };
