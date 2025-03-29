import { Gamemode } from "@serenityjs/protocol";
import { Awaitable } from "@serenityjs/emitter";

import { Player } from "../../player";
import { EntityTrait } from "../trait";
import { Entity } from "../../entity";

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
  public onChat?(message: string): Awaitable<boolean | void>;

  /**
   * Called when a players gamemode is changed.
   * @param previous The previous gamemode of the player.
   */
  public onGamemodeChange?(previous: Gamemode): Awaitable<void>;

  /**
   * Called when the player jumps.
   */
  public onJump?(): Awaitable<void>;

  /**
   * Called when the player starts sneaking.
   */
  public onStartSneaking?(): Awaitable<void>;

  /**
   * Called when the player stops sneaking.
   */
  public onStopSneaking?(): Awaitable<void>;

  /**
   * Called when the player starts sprinting.
   */
  public onStartSprinting?(): Awaitable<void>;

  /**
   * Called when the player stops sprinting.
   */
  public onStopSprinting?(): Awaitable<void>;

  /**
   * Called when the player attacks an entity.
   * @param entity The entity that the player attacked.
   */
  public onAttackEntity?(target: Entity): Awaitable<void>;
}

export { PlayerTrait };
