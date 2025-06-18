import { ItemUseMethod, BlockPosition } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { Entity, type Player } from "../../entity";

import { ItemStackTrait } from "./trait";

import type { EntityEntry } from "../../types";
import type { ItemStackUseOnBlockOptions } from "../types";

class ItemStackSpawnEggTrait extends ItemStackTrait {
  public static readonly identifier = "spawn_egg";
  public static readonly tag = "minecraft:spawn_egg";

  /**
   * The entity type that this spawn egg will spawn.
   */
  public entityType: EntityIdentifier | null = null;

  public onAdd(): void {
    // Check if the item type ends with the spawn egg tag.
    if (!this.item.identifier.endsWith("_spawn_egg")) return;

    // Slice the item identifier to get the entity type.
    const entityType = this.item.identifier.slice(0, -10) as EntityIdentifier;

    // Set the entity type to the spawn egg trait.
    this.entityType = entityType;
  }

  public onUseOnBlock(
    player: Player,
    options: ItemStackUseOnBlockOptions
  ): void {
    // Check if the entity type is defined.
    if (options.method !== ItemUseMethod.Place || !this.entityType) return;

    // Calculate the position to spawn the entity.
    const position = BlockPosition.toVector3f(options.targetBlock.position)
      .add(options.clickPosition)
      .add({ x: 0, y: -0.75, z: 0 });

    // Check if any entity data should be added to the entity.
    const entry =
      this.item.getDynamicProperty<EntityEntry>("entity_data") ?? undefined;

    // Check if the entity data entry is defined.
    if (entry) {
      // Create the entity with the entity data.
      const entity = new Entity(player.dimension, this.entityType, { entry });

      // Increase the Y position by 1.
      position.y += 1;

      // Set the entity position.
      entity.position.set(position);

      // Spawn the entity in the player's dimension.
      entity.spawn();
    } else {
      // Create the entity without the entity data.
      player.dimension.spawnEntity(this.entityType, position);
    }
  }
}

export { ItemStackSpawnEggTrait };
