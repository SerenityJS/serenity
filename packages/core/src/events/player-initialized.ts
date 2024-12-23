import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

/**
 * Signal is emitted when a player has been fully initialized into the server.
 * This signal is only emitted once per player, and when emitted, the player is ready to be spawned into a world.
 */
class PlayerInitializedSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerInitialized;

  /**
   * The player that has been initialized.
   */
  public readonly player: Player;

  /**
   * Creates a new player initialized event signal.
   * @param player The player that has been initialized.
   */

  public constructor(player: Player) {
    super(player.world);
    this.player = player;
  }
}

export { PlayerInitializedSignal };
