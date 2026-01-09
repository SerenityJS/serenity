import { Block } from "../block";
import { WorldEvent } from "../enums";
import { Player } from "../entity";

import { EventSignal } from "./event-signal";

class PlayerStopBreakingBlockSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerStopBreakingBlock;

  /**
   * The player that stopped breaking the block.
   */
  public readonly player: Player;

  /**
   * The block that the player stopped breaking.
   */
  public readonly block: Block;

  public constructor(player: Player, block: Block) {
    super(player.world);
    this.player = player;
    this.block = block;
  }
}

export { PlayerStopBreakingBlockSignal };
