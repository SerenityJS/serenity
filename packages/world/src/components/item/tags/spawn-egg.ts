import { BlockCoordinates, ItemUseMethod } from "@serenityjs/protocol";

import { ItemUseCause } from "../../../enums";

import { ItemTagComponent } from "./tag";

import type { ItemStack } from "../../../item";
import type { EntityIdentifier, EntityType } from "@serenityjs/entity";
import type { Items } from "@serenityjs/item";
import type { Player } from "../../../player";

class ItemSpawnEggComponent<T extends keyof Items> extends ItemTagComponent<T> {
	public static readonly identifier = "minecraft:spawn_egg";

	public static readonly tag = this.identifier;

	/**
	 * The entity type the spawn egg will spawn.
	 * If null, the entity type will be determined by the spawn egg item.
	 */
	public entityType: EntityType | null = null;

	/**
	 * Creates a new instance of the ItemSpawnEggComponent class.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemSpawnEggComponent.identifier);
	}

	public onUse(
		player: Player,
		cause: ItemUseCause,
		blockPosition: BlockCoordinates
	): ItemUseMethod | undefined {
		// Check if the spawn egg is being used in the correct context.
		if (cause !== ItemUseCause.Place) return;

		// Check if there is an entity type set.
		if (this.entityType) {
			// Spawn the entity.
		} else {
			// Trim the identifier to get the entity identifier.
			const identifier = this.item.type.identifier.slice(
				0,
				-10
			) as EntityIdentifier;

			// Convert the block position to a vector.
			const position = BlockCoordinates.toVector3f(blockPosition);

			// Add 1 to the y position to prevent the entity from spawning inside the block.
			position.x += 0.5;
			position.y += 1;
			position.z += 0.5;

			// Spawn the entity.
			player.dimension.spawnEntity(identifier, position);
		}

		return ItemUseMethod.Place;
	}
}

export { ItemSpawnEggComponent };
