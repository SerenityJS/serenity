import { ItemUseMethod, BlockPosition } from "@serenityjs/protocol";

import { Player } from "../../entity";
import { EntityIdentifier, ItemIdentifier } from "../../enums";
import { ItemUseOnBlockOptions } from "../../types";

import { ItemTrait } from "./trait";

class ItemSpawnEggTrait<T extends ItemIdentifier> extends ItemTrait<T> {
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

  public onUseOnBlock(player: Player, options: ItemUseOnBlockOptions): void {
    // Check if the entity type is defined.
    if (options.method !== ItemUseMethod.Place || !this.entityType) return;

    // Calculate the position to spawn the entity.
    const position = BlockPosition.toVector3f(options.targetBlock.position)
      .add(options.clickPosition)
      .add({ x: 0, y: 1, z: 0 });

    // Spawn the entity at the calculated position.
    player.dimension.spawnEntity(this.entityType, position);
  }
}

export { ItemSpawnEggTrait };
