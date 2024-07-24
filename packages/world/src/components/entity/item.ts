import { EntityIdentifier } from "@serenityjs/entity";
import {
	ActorEventIds,
	ActorEventPacket,
	LevelSoundEvent,
	LevelSoundEventPacket,
	TakeItemActorPacket,
	Vector3f
} from "@serenityjs/protocol";

import { EntityComponent } from "./entity-component";

import type { Player } from "../../player";
import type { Entity } from "../../entity";
import type { ItemStack } from "../../item";

class EntityItemComponent extends EntityComponent {
	public static readonly identifier = "minecraft:item";

	/**
	 * The item stack of the component.
	 */
	public readonly itemStack: ItemStack;

	/**
	 * The birth tick of the item.
	 */
	public readonly birthTick: bigint;

	/**
	 * The lifespan of the item in ticks.
	 */
	public lifeSpan: number = 6000;

	/**
	 * The pickup tick of the item.
	 */
	protected pickupTick: bigint | null = null;

	/**
	 * The target player of the item.
	 */
	protected target: Player | null = null;

	protected merging = false;

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

		// Set the birth tick of the item
		this.birthTick = entity.dimension.world.currentTick;
	}

	/**
	 * Gets the lifespan of the item.
	 * @returns The lifespan of the item.
	 */
	public getLifeSpan(): number {
		return this.lifeSpan;
	}

	/**
	 * Sets the lifespan of the item.
	 * @param value The lifespan of the item.
	 */
	public setLifeSpan(value: number): void {
		this.lifeSpan = value;
	}

	/**
	 * Picks up the item by a player.
	 * @param player The player that picked up the item.
	 */
	public pickup(player: Player): void {
		// Teleport the item to the player
		this.entity.teleport(player.position);

		// Set the player as the target
		this.target = player;

		// Set the pickup tick
		this.pickupTick = this.entity.dimension.world.currentTick;
	}

	public increment(amount?: number): void {
		this.itemStack.increment(amount);

		const packet = new ActorEventPacket();
		packet.eventId = ActorEventIds.ITEM_ENTITY_MERGE;
		packet.eventData = this.itemStack.amount;
		packet.actorRuntimeId = this.entity.runtime;

		this.entity.dimension.broadcast(packet);
	}

	public decrement(amount?: number): void {
		this.itemStack.decrement(amount);

		const packet = new ActorEventPacket();
		packet.eventId = ActorEventIds.ITEM_ENTITY_MERGE;
		packet.eventData = this.itemStack.amount;
		packet.actorRuntimeId = this.entity.runtime;

		this.entity.dimension.broadcast(packet);
	}

	public onTick(): void {
		// Get the current tick
		const current = this.entity.dimension.world.currentTick;

		// Check if the item is on the ground and the current tick is a multiple of 25
		if (
			this.entity.onGround &&
			this.entity.dimension.world.currentTick % 25n === 0n &&
			this.pickupTick === null
		) {
			// Get all the item entities in the dimension
			const entities = this.entity.dimension
				.getEntities()
				.filter((x) => x.isItem());

			// Check if there is a existing item stack nearby within a 0.5 block radius
			for (const [index, entity] of entities.entries()) {
				// Continue if the item is being merged
				if (this.merging && index !== entities.length - 1) continue;
				// Check if the item is being merged and the entity is the last item
				else if (this.merging && index === entities.length - 1)
					// Set merging to false as its done
					this.merging = false;

				// Check if the entity is the same as the item
				if (entity === this.entity) continue;

				// Calculate the distance between the entities
				const distance = entity.position.subtract(this.entity.position);

				// Check if the distance is less than 0.5 blocks
				if (
					Math.abs(distance.x) <= 0.9 &&
					Math.abs(distance.y) <= 0.9 &&
					Math.abs(distance.z) <= 0.9
				) {
					// Get the item component of the entity
					const component = entity.getComponent(EntityItemComponent.identifier);
					const existingItem = component.itemStack;

					// Check if the existing item stack is full
					if (existingItem.amount >= existingItem.maxAmount) continue;

					// Check if the item stacks are the same
					if (!existingItem.equals(this.itemStack)) continue;

					// Increment the item stack and despawn the existing item
					this.increment(existingItem.amount);
					component.entity.despawn();

					// Set merging to true
					this.merging = true;
				}
			}
		}

		// Check if there is a target player
		if (
			this.target && // Check if the pickup tick is not null
			this.pickupTick && // Check if the current tick is greater than the pickup tick
			current - this.pickupTick >= 5n
		) {
			// Create a new take item actor packet
			const take = new TakeItemActorPacket();
			take.itemUniqueId = this.entity.unique;
			take.targetUniqueId = this.target.unique;

			// Create a new level sound event packet
			const sound = new LevelSoundEventPacket();
			sound.event = LevelSoundEvent.Pop;
			sound.position = this.target.position;
			sound.actorIdentifier = this.entity.type.identifier;
			sound.data = -1;
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Send the packets to the player
			this.target.session.send(sound, take);

			// Get the players inventory component
			const inventory = this.target.getComponent("minecraft:inventory");

			// Add the item to the players inventory
			inventory.container.addItem(this.itemStack);

			// Remove the item from the dimension
			this.entity.despawn();
		} else if (this.target) return;

		// Check if the item has been alive for 15 ticks
		// This is to prevent the item from being picked up immediately
		if (current - this.birthTick <= 15n) return;

		// Check if the current tick is a multiple of 5
		if (current % 5n !== 0n) return;

		// Check if there is a player nearby within a 1 block radius
		const players = this.entity.dimension.getPlayers();
		const item = this.entity.position;

		// Check if a player is within a 1 block radius
		for (const player of players) {
			// Check if the player is alive
			if (!player.isAlive) continue;

			// Calculate the distance between the player and the item
			const playerPos = player.position;
			const distance = playerPos.subtract(item);

			// Calculate the distance between the player and the item
			if (
				Math.abs(distance.x) <= 1 &&
				Math.abs(distance.y - 1) <= 1 &&
				Math.abs(distance.z) <= 1
			) {
				// Teleport the item to the player
				this.entity.teleport(
					new Vector3f(playerPos.x, playerPos.y - 1, playerPos.z)
				);

				// Set the player as the target
				this.target = player;

				// Set the pickup tick
				this.pickupTick = current;
			}
		}

		// Check if the item has been alive for the lifespan
		if (current - this.birthTick >= BigInt(this.lifeSpan)) {
			// Remove the item from the dimension
			this.entity.despawn();
		}
	}
}

export { EntityItemComponent };
