import { Block } from "../block";
import { WorldEvent } from "../enums";
import { Player } from "../entity";

import { EventSignal } from "./event-signal";

class PlayerStartBreakingBlockSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerStartBreakingBlock;

  /**
   * The player that started breaking the block.
   */
  public readonly player: Player;

  /**
   * The block that the player started breaking.
   */
  public readonly block: Block;

  public constructor(player: Player, block: Block) {
    super(player.world);
    this.player = player;
    this.block = block;
  }
}

export { PlayerStartBreakingBlockSignal };
