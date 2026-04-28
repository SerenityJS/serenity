import { ActorFlag, Gamemode } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityCollisionTrait extends EntityTrait {
  public static readonly identifier = "collision";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The default height of the entity collision box.
   */
  public static defaultHeight = 1.62;

  /**
   * The default width of the entity collision box.
   */
  public static defaultWidth = 0.6;

  /**
   * The height of the entity collision box.
   */
  public height: number = EntityCollisionTrait.defaultHeight;

  /**
   * The width of the entity collision box.
   */
  public width: number = EntityCollisionTrait.defaultWidth;

  /**
   * The friction force being applied to the entity.
   */
  public frictionForce: number = 1;

  /**
   * The friction scaler value of the entity.
   */
  public frictionScaler: number = 0.97;

  /**
   * The x-axis collision value of the entity.
   * -1 = colliding with a wall -x
   * 0 = not colliding with a wall
   * 1 = colliding with a wall +x
   */
  public xAxisCollision: number = 0;

  /**
   * The y-axis collision value of the entity.
   * -1 = colliding with the -y
   * 0 = not colliding with the ground or ceiling
   * 1 = colliding with the +y
   */
  public yAxisCollision: number = 0;

  /**
   * The z-axis collision value of the entity.
   * -1 = colliding with a wall -z
   * 0 = not colliding with a wall
   * 1 = colliding with a wall +z
   */
  public zAxisCollision: number = 0;

  public onAdd(): void {
    if (this.entity.isItem()) {
      // Set the entity height to 0.25 if the entity is an item
      this.height = 0.25;
      this.width = 0.25;
    } else {
      // Set the default height and width values
      this.height = 1.62;
      this.width = 0.6;
    }

    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.getActorFlag(ActorFlag.HasCollision)) {
      // Set the entity flag for gravity
      this.entity.flags.setActorFlag(ActorFlag.HasCollision, true);
    }
  }

  public onRemove(): void {
    // Remove the entity flag for gravity
    this.entity.flags.setActorFlag(ActorFlag.HasCollision);
  }

  public onGamemodeChange(): void {
    // Check if the entity is not a player
    if (!this.entity.isPlayer()) return;

    // If the player is now in spectator mode, collision should be disabled
    if (this.entity.getGamemode() === Gamemode.Spectator)
      this.entity.flags.setActorFlag(ActorFlag.HasCollision, false);
    // If the player is not in spectator mode, collision should be enabled
    else this.entity.flags.setActorFlag(ActorFlag.HasCollision, true);
  }
}

export { EntityCollisionTrait };
