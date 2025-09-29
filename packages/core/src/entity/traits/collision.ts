import { ActorFlag, Gamemode } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";
import { EntityPhysicsTrait } from "./physics";

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

  public onTick(): void {
    // Check if the entity is alive
    if (!this.entity.isAlive) return;

    // Check if the entity has a physics trait
    if (!this.entity.hasTrait(EntityPhysicsTrait)) return;

    // Check if the entity is colliding with a wall
    this.yAxisCollision = this.checkYCollision();
    this.xAxisCollision = this.checkXCollision();
    this.zAxisCollision = this.checkZCollision();

    // Check if the entity should be on the ground
    if (this.yAxisCollision === -1 && !this.entity.onGround)
      this.entity.onGround = true;
    else if (this.yAxisCollision === 1 && this.entity.onGround)
      this.entity.onGround = false;
  }

  public checkXCollision(): number {
    // Get the entity's current position
    const position = this.entity.position;

    // Check if the entity is colliding with a wall
    const left = this.entity.dimension.getPermutation({
      x: Math.floor(position.x - this.width),
      y: Math.floor(position.y),
      z: Math.floor(position.z)
    });

    // Check if the entity is colliding with a solid block
    if (left.type.solid) return -1;

    // Check if the entity is colliding with a wall
    const right = this.entity.dimension.getPermutation({
      x: Math.floor(position.x + this.width),
      y: Math.floor(position.y),
      z: Math.floor(position.z)
    });

    // Check if the entity is colliding with a solid block
    if (right.type.solid) return 1;

    return 0;
  }

  public checkYCollision(): number {
    // Get the entity's current position
    const position = this.entity.position;
    const vy = this.entity.velocity.y;

    // Check if the entity is colliding with the ground
    const below = this.entity.dimension.getPermutation({
      x: Math.floor(position.x),
      y: Math.floor(position.y + vy + -0.08),
      z: Math.floor(position.z)
    });

    // Set the friction force to the block below
    this.frictionForce = below.components.getFriction() * this.frictionScaler;

    // Check if the entity is colliding with a solid block
    if (below.type.solid) return -1;

    // Check if the entity is colliding with the ceiling
    const above = this.entity.dimension.getPermutation({
      x: Math.floor(position.x),
      y: Math.floor(position.y + vy + -0.08),
      z: Math.floor(position.z)
    });

    // Set the friction force to the block above
    this.frictionForce = above.components.getFriction() * this.frictionScaler;

    // Check if the entity is colliding with a solid block
    if (above.type.solid) return 1;

    return 0;
  }

  public checkZCollision(): number {
    // Get the entity's current position
    const position = this.entity.position;

    // Check if the entity is colliding with a wall
    const front = this.entity.dimension.getPermutation({
      x: Math.floor(position.x),
      y: Math.floor(position.y),
      z: Math.floor(position.z - this.width)
    });

    // Check if the entity is colliding with a solid block
    if (front.type.solid) return -1;

    // Check if the entity is colliding with a wall
    const back = this.entity.dimension.getPermutation({
      x: Math.floor(position.x),
      y: Math.floor(position.y),
      z: Math.floor(position.z + this.width)
    });

    // Check if the entity is colliding with a solid block
    if (back.type.solid) return 1;

    return 0;
  }
}

export { EntityCollisionTrait };
