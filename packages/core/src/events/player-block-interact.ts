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
   * The player's held item after the interaction.
   */
  public itemStack: ItemStack | null;

  /**
   * Whether the interaction will result in a block being placed.
   * The position of the block will be relative to the `clickedFace` property.
   */
  public placingBlock: boolean;

  public constructor(source: Player, block: Block, placingBlock = false) {
    super(source.world);
    this.source = source;
    this.block = block;
    this.itemStack = source.getHeldItem();
    this.placingBlock = placingBlock;
  }
}

export { PlayerInteractWithBlockSignal };
