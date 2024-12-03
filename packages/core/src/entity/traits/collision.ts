import {
  ActorDataId,
  ActorFlag,
  Gamemode,
  Vector3f
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { Entity } from "../entity";

import { EntityTrait } from "./trait";

class EntityCollisionTrait extends EntityTrait {
  public static readonly identifier = "collision";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The height of the entity collision box.
   */
  public get height(): number {
    // Get the entity collision height
    return this.entity.hitboxHeight;
  }

  /**
   * The height of the entity collision box.
   */
  public set height(value: number) {
    // Set the entity collision height
    this.entity.hitboxHeight = value;
  }

  /**
   * The width of the entity collision box.
   */
  public get width(): number {
    // Get the entity collision width
    return this.entity.hitboxWidth;
  }

  /**
   * The width of the entity collision box.
   */
  public set width(value: number) {
    // Set the entity collision width
    this.entity.hitboxWidth = value;
  }

  public onAdd(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.HasCollision)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.HasCollision, true);
    }

    // Check if the entity has a metadata value for collision height
    if (!this.entity.metadata.has(ActorDataId.Reserved054)) {
      // Check if the entity is an item
      if (this.entity.isItem()) this.height = 0.25;
      // Set the default height value
      else this.height = 1.75;
    }

    // Check if the entity has a metadata value for collision width
    if (!this.entity.metadata.has(ActorDataId.Reserved053)) {
      // Check if the entity is an item
      if (this.entity.isItem()) this.width = 0.25;
      // Set the default width value
      else this.width = 0.6;
    }
  }

  public onRemove(): void {
    // Remove the entity flag for gravity
    this.entity.flags.delete(ActorFlag.HasCollision);

    // Remove the entity collision height
    this.entity.metadata.delete(ActorDataId.Reserved054);

    // Remove the entity collision width
    this.entity.metadata.delete(ActorDataId.Reserved053);
  }

  public onGamemodeChange(): void {
    // Check if the entity is not a player
    if (!this.entity.isPlayer()) return;

    // If the player is now in spectator mode, collision should be disabled
    if (this.entity.gamemode === Gamemode.Spectator)
      this.entity.flags.set(ActorFlag.HasCollision, false);
    // If the player is not in spectator mode, collision should be enabled
    else this.entity.flags.set(ActorFlag.HasCollision, true);
  }

  public onTick(): void {
    // Check if the entity is alive
    if (!this.entity.isAlive) return;

    // Check if the entity is an item
    if (this.entity.isItem()) return;

    // Get the entities around the entity
    const entities = this.entity.dimension.getEntities({
      position: this.entity.position,
      minDistance: 0,
      maxDistance: 1
    });

    // Check if there are no entities around the entity
    if (entities.length === 0) return;

    // Check if the entity is colliding with another entity
    entities.forEach((entity) => {
      // Check if the entity is the same
      if (entity === this.entity) return;

      // Check if the entity is an item or a player
      if (entity.isItem() || entity.isPlayer()) return;

      // Check if the entity is colliding with another entity
      if (this.isCollidingWith(entity)) {
        // Push the target entity into direction the entity is facing;

        const { headYaw, pitch } = this.entity.rotation;

        // Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
        const headYawRad = (headYaw * Math.PI) / 180;
        const pitchRad = (pitch * Math.PI) / 180;

        // Reduce the strength of the velocity
        const x = (-Math.sin(headYawRad) * Math.cos(pitchRad)) / 5;
        const z = (Math.cos(headYawRad) * Math.cos(pitchRad)) / 5;

        // Create a new motion vector
        const motion = new Vector3f(x, 0, z);

        // Set the entity to be moving
        entity.isMoving = true;

        // Add the motion to the entity
        entity.addMotion(motion);
      }
    });
  }

  /**
   * Checks if the entity is colliding with another entity.
   * @param other The entity to check collision with.
   * @returns True if the entities are colliding, false otherwise.
   */
  public isCollidingWith(other: Entity): boolean {
    // Get the position of the entity
    const pos = this.entity.position;

    // Get the position of the other entity
    const otherPos = other.position;

    // Check if the x positions are colliding
    const x = pos.x - this.width / 2 < otherPos.x + other.hitboxWidth / 2;
    const y = pos.y - this.height < otherPos.y + other.hitboxHeight;
    const z = pos.z - this.width / 2 < otherPos.z + other.hitboxWidth / 2;

    // Check if the entities are colliding
    return x && y && z;
  }
}

export { EntityCollisionTrait };
