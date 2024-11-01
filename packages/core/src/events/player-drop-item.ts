import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerDropItemSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerDropItem;

  /**
   * The player that dropped the item.
   */
  public readonly player: Player;

  /**
   * The item stack that was dropped.
   */
  public readonly itemStack: ItemStack;

  /**
   * The amount of items that were dropped.
   */
  public readonly amount: number;

  /**
   * Creates a new player drop item signal.
   * @param player The player that dropped the item.
   * @param itemStack The item stack that was dropped.
   * @param amount The amount of items that were dropped.
   */
  public constructor(player: Player, itemStack: ItemStack, amount: number) {
    super(player.dimension.world);
    this.player = player;
    this.itemStack = itemStack;
    this.amount = amount;
  }
}

export { PlayerDropItemSignal };
