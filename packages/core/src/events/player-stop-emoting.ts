import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerStopEmotingSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerStopEmoting;

  /**
   * The player that started emoting.
   */
  public readonly player: Player;

  /**
   * The emote the player started.
   */
  public readonly emote: string;

  /**
   * Create a new player stop emoting signal.
   * @param player The player that stopped emoting.
   * @param emote The emote the player stopped.
   */
  public constructor(player: Player, emote: string) {
    super(player.world);
    this.player = player;
    this.emote = emote;
  }
}

export { PlayerStopEmotingSignal };
