import { Entity, Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerInteractWithEntitySignal extends EventSignal {
  public static readonly identifier: WorldEvent =
    WorldEvent.PlayerInteractWithEntity;

  /**
   * The player that triggered the interaction.
   */
  public readonly source: Player;

  /**
   * The entity that was interacted with.
   */
  public readonly target: Entity;

  /**
   * The player's held item that was used to interact with after the interaction
   */
  public itemStack: ItemStack | null;

  /**
   * The player's item that was used to interact with before the interaction
   */
  public beforeItemStack: ItemStack | null;

  public constructor(
    source: Player,
    target: Entity,
    beforeItemStack: ItemStack | null,
    itemStack: ItemStack | null
  ) {
    super(source.world);
    this.source = source;
    this.target = target;
    this.beforeItemStack = beforeItemStack;
    this.itemStack = itemStack;
  }
}

export { PlayerInteractWithEntitySignal };
