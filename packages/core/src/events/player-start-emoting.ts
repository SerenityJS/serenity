import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerStartEmotingSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerStartEmoting;

  /**
   * The player that started emoting.
   */
  public readonly player: Player;

  /**
   * The emote the player started.
   */
  public readonly emote: string;

  /**
   * The duration of the emote in ticks.
   */
  public readonly tickLength: number;

  /**
   * Create a new player start emoting signal.
   * @param player The player that started emoting.
   * @param emote The emote the player started.
   * @param tickLength The duration of the emote in ticks.
   */
  public constructor(player: Player, emote: string, tickLength: number) {
    super(player.world);
    this.player = player;
    this.emote = emote;
    this.tickLength = tickLength;
  }
}

export { PlayerStartEmotingSignal };
