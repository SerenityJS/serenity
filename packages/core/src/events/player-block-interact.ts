import { Block } from "../block";
import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { ItemStack } from "../item";

import { EventSignal } from "./event-signal";

class PlayerInteractWithBlockSignal extends EventSignal {
  public static readonly identifier: WorldEvent =
    WorldEvent.PlayerInteractWithBlock;

  /**
   * The player that triggered the interaction.
   */
  public source: Player;

  /**
   * The block that was interacted with.
   */
  public block: Block;

  /**
   * The player's held item before the interaction.
   */
  public beforeItemStack: ItemStack | null;

  /**
   * The player's held item after the interaction.
   */
  public itemStack: ItemStack | null;

  public constructor(
    source: Player,
    block: Block,
    beforeItemStack: ItemStack | null,
    itemStack: ItemStack | null
  ) {
    super(source.world);
    this.source = source;
    this.block = block;
    this.beforeItemStack = beforeItemStack;
    this.itemStack = itemStack;
  }
}

export { PlayerInteractWithBlockSignal };
