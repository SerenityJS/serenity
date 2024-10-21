import { Player } from "../../player";
import { EntityTrait } from "../trait";

class PlayerTrait extends EntityTrait {
  /**
   * The player that this trait is attached to.
   */
  public readonly player = this.entity as Player;

  /**
   * Called when the player sends a chat message.
   * @param message The message that the player sent.
   * @returns Whether the chat message was successful; default is true
   */
  public onChat?(message: string): boolean | void;
}

export { PlayerTrait };
