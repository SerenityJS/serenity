import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerStopUsingItemSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerStopUsingItem;

  /**
   * The player that stopped using the item.
   */
  public readonly player: Player;

  /**
   * The item stack that the player stopped using.
   */
  public readonly itemStack: ItemStack;

  /**
   * Creates a new player start using item signal.
   * @param player The player that stopped using the item.
   * @param itemStack The item stack that the player stopped using.
   */
  public constructor(player: Player, itemStack: ItemStack) {
    super(player.dimension.world);
    this.player = player;
    this.itemStack = itemStack;
  }
}

export { PlayerStopUsingItemSignal };
