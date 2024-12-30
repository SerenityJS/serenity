import { ItemUseMethod } from "@serenityjs/protocol";

import { Entity, Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { PlayerUseItemSignal } from "./player-use-item";

class PlayerUseItemOnEntitySignal extends PlayerUseItemSignal {
  public static readonly identifier = WorldEvent.PlayerUseItemOnEntity;
  /**
   * The target entity that the item is being used on.
   */
  public readonly targetEntity: Entity;

  /**
   * Creates a new player use item signal.
   * @param player The player that used the item.
   * @param itemStack The item stack that the player used.
   * @param useMethod The method that the player used the item with.
   * @param targetEntity The target Entity that the item is being used on.
   */
  public constructor(
    player: Player,
    itemStack: ItemStack,
    useMethod: ItemUseMethod,
    targetEntity: Entity
  ) {
    super(player, itemStack, useMethod);
    this.targetEntity = targetEntity;
  }
}

export { PlayerUseItemOnEntitySignal };
