import { WorldEvent } from "../enums";
import { Player } from "../entity";

import { BlockUpdateSignal } from "./block-update";

import type { ItemStack } from "../item";
import type { Block } from "../block";

class PlayerBreakBlockSignal extends BlockUpdateSignal {
  public static readonly identifier = WorldEvent.PlayerBreakBlock;

  /**
   * The player placing the block.
   */
  public readonly player: Player;

  /**
   * The item stack that is being used to break the block, or null if empty hand.
   */
  public readonly itemStack: ItemStack | null;

  /**
   * Whether the block should drop loot items when destroyed.
   */
  public dropLoot: boolean = true;

  /**
   * Creates a new player break block signal.
   * @param player The player breaking the block.
   * @param itemStack The item stack that is being used to break the block, or null if empty hand.
   */
  public constructor(block: Block, player: Player) {
    super(block);
    this.player = player;
    this.itemStack = player.getHeldItem();
  }
}

export { PlayerBreakBlockSignal };
