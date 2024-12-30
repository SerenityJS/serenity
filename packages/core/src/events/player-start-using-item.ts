import { ItemUseMethod } from "@serenityjs/protocol";

import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerStartUsingItemSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerStartUsingItem;

  /**
   * The player that started using the item.
   */
  public readonly player: Player;

  /**
   * The item stack that the player started using.
   */
  public readonly itemStack: ItemStack;

  /**
   * The method that the player started using the item with.
   */
  public readonly useMethod: ItemUseMethod;

  /**
   * Creates a new player start using item signal.
   * @param player The player that started using the item.
   * @param itemStack The item stack that the player started using.
   * @param useMethod The method that the player started using the item with.
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

export { PlayerStartUsingItemSignal };
