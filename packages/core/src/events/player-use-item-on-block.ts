import { ItemUseMethod } from "@serenityjs/protocol";

import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";
import { Block } from "../block";

import { PlayerUseItemSignal } from "./player-use-item";

class PlayerUseItemOnBlockSignal extends PlayerUseItemSignal {
  public static readonly identifier = WorldEvent.PlayerUseItemOnBlock;
  /**
   * The target block that the item is being used on.
   */
  public readonly targetBlock: Block;

  /**
   * Creates a new player use item signal.
   * @param player The player that used the item.
   * @param itemStack The item stack that the player used.
   * @param useMethod The method that the player used the item with.
   * @param targetBlock The target block that the item is being used on.
   */
  public constructor(
    player: Player,
    itemStack: ItemStack,
    useMethod: ItemUseMethod,
    targetBlock: Block
  ) {
    super(player, itemStack, useMethod);
    this.targetBlock = targetBlock;
  }
}

export { PlayerUseItemOnBlockSignal };
