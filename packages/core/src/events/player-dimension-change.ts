import { Player } from "../entity";
import { WorldEvent } from "../enums";
import { Dimension } from "../world";

import { EventSignal } from "./event-signal";

class PlayerDimensionChangeSignal extends EventSignal {
  public static readonly identifier: WorldEvent =
    WorldEvent.PlayerDimensionChange;

  /**
   * The player that changed dimensions.
   */
  public readonly player: Player;

  /**
   * The dimension the player moved to.
   */
  public readonly fromDimension: Dimension;

  /**
   * The dimension the player moved from.
   */
  public readonly toDimension: Dimension;

  public constructor(
    player: Player,
    fromDimension: Dimension,
    toDimension: Dimension
  ) {
    super(player.getWorld());
    this.player = player;
    this.fromDimension = fromDimension;
    this.toDimension = toDimension;
  }
}

export { PlayerDimensionChangeSignal };
