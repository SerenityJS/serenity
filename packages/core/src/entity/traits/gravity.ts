import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityGravityTrait extends EntityTrait {
  public static readonly identifier = "gravity";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The current distance the entity is falling from.
   */
  public fallingDistance = 0;

  public onAdd(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.HasGravity)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.HasGravity, true);
    }
  }

  public onRemove(): void {
    // Check if the entity has a metadata flag value for gravity
    if (this.entity.flags.has(ActorFlag.HasGravity)) {
      // Remove the entity flag for gravity
      this.entity.flags.delete(ActorFlag.HasGravity);
    }
  }

  public onTick(): void {
    // Check if the entity is on the ground
    if (this.entity.onGround) {
      // Reset the falling distance of the entity, if it is not already 0
      if (this.fallingDistance !== 0) this.fallingDistance = 0;

      // Reset the entity to not be falling
      this.entity.isFalling = false;

      // Return, as the entity is not falling
      return;
    }

    // Get the topmost block of the entity
    const top = this.entity.dimension.getTopmostBlock(this.entity.position);

    // Add the y position of the block and entity
    const blockY = top.position.y + 64;
    const entityY = this.entity.position.y + 64 - 1.62;

    // Calculate the distance between the entity and the block
    const distance = Math.round(entityY - blockY);
    if (distance < this.fallingDistance) return;

    // Set the falling distance of the entity
    this.fallingDistance = distance;

    // Set the entity to be falling
    this.entity.isFalling = true;
  }
}

export { EntityGravityTrait };
