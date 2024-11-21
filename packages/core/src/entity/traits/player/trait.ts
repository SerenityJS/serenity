import { Gamemode } from "@serenityjs/protocol";

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

  /**
   * Called when a players gamemode is changed.
   * @param previous The previous gamemode of the player.
   */
  public onGamemodeChange?(previous: Gamemode): void;

  /**
   * Called when the player jumps.
   */
  public onJump?(): void;

  /**
   * Called when the player starts sneaking.
   */
  public onStartSneaking?(): void;

  /**
   * Called when the player stops sneaking.
   */
  public onStopSneaking?(): void;

  /**
   * Called when the player starts sprinting.
   */
  public onStartSprinting?(): void;

  /**
   * Called when the player stops sprinting.
   */
  public onStopSprinting?(): void;
}

export { PlayerTrait };
