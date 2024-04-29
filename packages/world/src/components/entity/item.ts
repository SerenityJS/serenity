import { EntityIdentifier } from "@serenityjs/entity";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";
import type { ItemStack } from "../../item";

class EntityItemComponent extends EntityComponent {
	public static readonly identifier = "minecraft:item";

	/**
	 * The item stack of the component.
	 */
	public readonly itemStack: ItemStack;

	/**
	 * Creates a new entity inventory component.
	 *
	 * @param entity The entity of the component.
	 * @param itemStack The item stack of the component.
	 * @returns A new entity inventory component.
	 */
	public constructor(entity: Entity, itemStack: ItemStack) {
		super(entity, EntityItemComponent.identifier);

		// Check if the entity type is an item
		// If not we throw an error
		if (entity.type.identifier !== EntityIdentifier.Item) {
			throw new Error("Entity must be an item");
		}

		// Set the item stack of the component
		this.itemStack = itemStack;
	}

	public onTick(): void {
		// TODO: Add lifespan to the item

		// Check if the tick is a multiple of 25
		const current = this.entity.dimension.world.currentTick;
		if (current % 25n !== 0n) return;

		// Check if there is a player nearby within a 1 block radius
		const players = this.entity.dimension.getPlayers();
		const item = this.entity.position;

		// Check if a player is within a 1 block radius
		for (const player of players) {
			const playerPos = player.position;
			const distance = playerPos.subtract(item);

			// Calculate the distance between the player and the item
			if (
				Math.abs(distance.x) <= 1 &&
				Math.abs(distance.y - 1) <= 1 &&
				Math.abs(distance.z) <= 1
			) {
				// TODO: Implement ItemActorTakePacket, this will have an animation of the item being picked up.

				// Despawn the item
				this.entity.despawn();

				// Add the item to the player's inventory
				const inventory = player.getComponent("minecraft:inventory");

				// Check if the player has an inventory
				if (!inventory) {
					throw new Error("Player must have an inventory");
				}

				// Add the item to the inventory container.
				inventory.container.addItem(this.itemStack);
			}
		}
	}
}

export { EntityItemComponent };
