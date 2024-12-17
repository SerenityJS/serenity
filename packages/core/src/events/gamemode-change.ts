import { Gamemode } from "@serenityjs/protocol";

import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerGamemodeChangeSignal extends EventSignal {
  public static readonly identifier: WorldEvent =
    WorldEvent.PlayerGamemodeChange;

  /**
   * The player that has changed his gamemode.
   */
  public readonly player: Player;

  /**
   * The gamemode that the player was previously in.
   */
  public readonly fromGamemode: Gamemode;

  /**
   * The new player's gamemode
   */
  public readonly toGamemode: Gamemode;

  public constructor(
    player: Player,
    fromGamemode: Gamemode,
    toGamemode: Gamemode
  ) {
    super(player.world);
    this.player = player;
    this.fromGamemode = fromGamemode;
    this.toGamemode = toGamemode;
  }
}

export { PlayerGamemodeChangeSignal };
