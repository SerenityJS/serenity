import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerDropExperienceSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerDropExperience;

  /**
   * The player that is dropping the experience.
   */
  public readonly player: Player;

  /**
   * The amount of experience being dropped.
   */
  public amount: number;

  /**
   * Creates a new instance of the PlayerDropExperienceSignal class.
   * @param player The player that is dropping the experience.
   * @param amount The amount of experience being dropped.
   */
  public constructor(player: Player, amount: number) {
    super(player.dimension.world);
    this.player = player;
    this.amount = amount;
  }
}

export { PlayerDropExperienceSignal };
