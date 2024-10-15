import { Player } from "../../player";
import { EntityTrait } from "../trait";

class PlayerTrait extends EntityTrait {
  /**
   * The player that this trait is attached to.
   */
  public readonly player = this.entity as Player;
}

export { PlayerTrait };
