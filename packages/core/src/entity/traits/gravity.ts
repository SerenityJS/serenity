import { ActorDamageCause, ActorFlag, Gamemode } from "@serenityjs/protocol";

import { BlockIdentifier, EntityIdentifier } from "../../enums";
import {
  EntityDespawnOptions,
  EntityFallOnBlockTraitEvent,
  EntitySpawnOptions
} from "../../types";

import { EntityTrait } from "./trait";
import { EntityHealthTrait } from "./attribute";

class EntityGravityTrait extends EntityTrait {
  public static readonly identifier = "gravity";
  public static readonly types = [EntityIdentifier.Player];

  public static defaultForce = -0.08;

  /**
   * The gravity force value of the entity.
   */
  public force: number = EntityGravityTrait.defaultForce;

  /**
   * The current distance the entity is falling from.
   */
  public fallingDistance = 0;

  /**
   * The current amount of ticks the entity has been falling for.
   */
  public fallingTicks = 0;

  public onAdd(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.getActorFlag(ActorFlag.HasGravity)) {
      // Set the entity flag for gravity
      this.entity.flags.setActorFlag(ActorFlag.HasGravity, true);
    }
  }

  public onRemove(): void {
    // Check if the entity has a metadata flag value for gravity
    if (this.entity.flags.getActorFlag(ActorFlag.HasGravity)) {
      // Remove the entity flag for gravity
      this.entity.flags.setActorFlag(ActorFlag.HasGravity);
    }
  }

  public onTick(): void {
    // Get the entity's position
    const position = this.entity.position.floor();

    // Get the entity's velocity
    const velocity = this.entity.velocity;

    // Check if the entity is falling
    if (
      this.fallingDistance > 0 &&
      this.fallingTicks > 0 &&
      this.entity.velocity.y < 0
    ) {
      // Set the entity falling flag
      this.entity.isFalling = true;
    } else {
      // Reset the entity falling flag
      this.entity.isFalling = false;
    }

    // Get the topmost block at the entity's position
    const block = this.dimension.getTopmostBlock(position.floor());

    // Calculate the entity's offset from the block
    const entityOffset = position.y - this.entity.getCollisionHeight() / 2;
    // Calculate the distance the entity is from the block
    const distance = Math.round(entityOffset - block.position.y);

    // Check if the distance is 0
    // This means the entity is on the block
    if (distance === 0 && this.fallingDistance > 0) {
      // Trigger the entity onFallOnBlock trait event
      for (const trait of this.entity.traits.values()) {
        // Attempt to trigger the onFallOnBlock event
        try {
          // Call the onFallOnBlock event
          trait.onFallOnBlock?.({
            block,
            fallDistance: this.fallingDistance,
            fallTicks: this.fallingTicks
          });
        } catch (reason) {
          // Log the error to the console
          this.entity.world.serenity.logger.error(
            `Failed to trigger onFallOnBlock event for entity "${this.entity.type.identifier}:${this.entity.uniqueId}" in dimension "${this.dimension.identifier}"`,
            reason
          );

          // Remove the trait from the entity
          this.entity.traits.delete(trait.identifier);
        }
      }

      // Reset the falling distance
      this.fallingDistance = 0;
    }

    // Check if the distance is greater than the falling distance
    if (distance > this.fallingDistance) this.fallingDistance = distance;

    // Check if the entity is falling
    if (this.fallingDistance > 0 && velocity.y < 0) this.fallingTicks++;
    else if (!this.entity.isFalling) this.fallingTicks = 0;
  }

  public onFallOnBlock(event: EntityFallOnBlockTraitEvent): void {
    // Check if the entity is a player
    if (this.entity.isPlayer()) {
      // Check if fall damage is disabled in the world
      if (!this.entity.world.gamerules.fallDamage) return;

      // Check if the entity is in creative mode or spectator mode
      if (this.entity.getGamemode() === Gamemode.Creative) return;
      if (this.entity.getGamemode() === Gamemode.Spectator) return;
    }

    // Check if the entity has fallen less than 10 ticks
    // If so, do not apply fall damage. The player is probably jumping.
    if (event.fallTicks < 10) return;

    // Check if the block is a slime block or honey block
    if (
      event.block.identifier === BlockIdentifier.Slime ||
      event.block.identifier === BlockIdentifier.HoneyBlock
    )
      return;

    // Check if the block above the event block is liquid
    const above = event.block.above();
    if (above.isLiquid) return;

    // Calculate the fall damage for the entity
    const fallDamage = Math.max(0, event.fallDistance - 3);
    if (fallDamage <= 0) return;

    // Check if the entity has a health trait
    if (this.entity.hasTrait(EntityHealthTrait)) {
      // Get the entity health trait
      const health = this.entity.getTrait(EntityHealthTrait);

      // Apply the fall damage to the entity
      health.applyDamage(fallDamage, undefined, ActorDamageCause.Fall);
    }
  }

  public onDespawn(details: EntityDespawnOptions): void {
    // Check if the entity is despawning due to dimension change
    if (details.changedDimensions) {
      // Set the entity flag for gravity to false
      this.entity.flags.setActorFlag(ActorFlag.HasGravity, false);
    }
  }

  public onSpawn(details: EntitySpawnOptions): void {
    // Check if the entity is spawning due to dimension change
    if (details.changedDimensions) {
      // Set the entity flag for gravity to true
      this.entity.flags.setActorFlag(ActorFlag.HasGravity, true);
    }
  }
}

export { EntityGravityTrait };
