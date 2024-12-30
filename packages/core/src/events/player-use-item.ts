import { ItemUseMethod } from "@serenityjs/protocol";

import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerUseItemSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.PlayerUseItem;

  /**
   * The player that used the item.
   */
  public readonly player: Player;

  /**
   * The item stack that the player used.
   */
  public readonly itemStack: ItemStack;

  /**
   * The method that the player used the item with.
   */
  public readonly useMethod: ItemUseMethod;

  /**
   * Creates a new player use item signal.
   * @param player The player that used the item.
   * @param itemStack The item stack that the player used.
   * @param useMethod The method that the player used the item with.
   */
  public constructor(
    player: Player,
    itemStack: ItemStack,
    useMethod: ItemUseMethod
  ) {
    super(player.world);
    this.player = player;
    this.itemStack = itemStack;
    this.useMethod = useMethod;
  }
}

export { PlayerUseItemSignal };
