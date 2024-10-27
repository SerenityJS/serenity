import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerJoinSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerJoin;

  /**
   * The player joining the world.
   */
  public readonly player: Player;

  /**
   * Creates a new player join event signal.
   * @param player The player joining the world..
   */
  public constructor(player: Player) {
    super(player.dimension.world);
    this.player = player;
  }
}

export { PlayerJoinSignal };
