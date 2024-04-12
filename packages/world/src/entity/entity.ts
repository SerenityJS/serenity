import {
	AddEntityPacket,
	type MetadataFlags,
	MetadataKey,
	RemoveEntityPacket,
	Rotation,
	Vector3f
} from "@serenityjs/protocol";

import { CardinalDirection, EntityIdentifier } from "../enums";
import {
	EntityAttributeComponent,
	type EntityComponent,
	EntityMetadataComponent
} from "../components";

import type { Player } from "../player";
import type { Dimension } from "../world";
import type {
	EntityAttributeComponents,
	EntityComponents
} from "../types/components";

class Entity {
	/**
	 * The running total of the entity runtime id.
	 */
	public static runtime = 1n;

	/**
	 * The components of the entity.
	 */
	public static readonly components: Array<typeof EntityComponent> = [];

	public readonly identifier: EntityIdentifier;
	public readonly runtime: bigint;
	public readonly unique: bigint;
	public readonly position: Vector3f;
	public readonly velocity: Vector3f;
	public readonly rotation: Rotation;
	public readonly components: Map<string, EntityComponent>;

	public dimension: Dimension;

	public constructor(
		identifier: EntityIdentifier,
		dimension: Dimension,
		uniqueId?: bigint
	) {
		// Readonly properties
		this.identifier = identifier;
		this.runtime = Entity.runtime++;
		this.unique = uniqueId ?? this.runtime; // Make sure to change this later
		this.position = new Vector3f(0, 0, 0);
		this.velocity = new Vector3f(0, 0, 0);
		this.rotation = new Rotation(0, 0, 0);
		this.components = new Map();

		// Mutable properties
		this.dimension = dimension;

		// Register all the components
		for (const component of new.target.components) {
			// create a new instance of the component
			// @ts-expect-error fix this
			const instance = new component(this);

			// set the component to the entity
			this.components.set(instance.identifier, instance);
		}
	}

	/**
	 * Ticks the entity instance.
	 */
	public tick(): void {}

	/**
	 * Checks if the entity is a player.
	 * @returns Whether or not the entity is a player.
	 */
	public isPlayer(): this is Player {
		return this.identifier === EntityIdentifier.Player;
	}

	/**
	 * Spawns the entity in the world.
	 * @param player The player to spawn the entity to.
	 */
	public spawn(player?: Player): void {
		// Create a new AddEntityPacket
		const packet = new AddEntityPacket();

		// Set the packet properties
		packet.uniqueEntityId = this.unique;
		packet.runtimeId = this.runtime;
		packet.identifier = this.identifier;
		packet.position = this.position;
		packet.velocity = this.velocity;
		packet.pitch = this.rotation.pitch;
		packet.yaw = this.rotation.yaw;
		packet.headYaw = this.rotation.headYaw;
		packet.bodyYaw = this.rotation.yaw;
		packet.attributes = [];
		packet.metadata = this.getMetadatas().map((entry) => {
			return {
				key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
				type: entry.type,
				value: entry.currentValue,
				flag: entry.flag ? (entry.key as MetadataFlags) : undefined
			};
		});
		packet.properties = {
			ints: [],
			floats: []
		};
		packet.links = [];

		// Send the packet to the player if it exists, otherwise broadcast it to the dimension
		player ? player.session.send(packet) : this.dimension.broadcast(packet);

		// Add the entity to the dimension
		this.dimension.entities.set(this.unique, this);
	}

	/**
	 * Despawns the entity from the world.
	 * @param player The player to despawn the entity from.
	 */
	public despawn(player?: Player): void {
		// Create a new RemoveEntityPacket
		const packet = new RemoveEntityPacket();

		// Set the packet properties
		packet.uniqueEntityId = this.unique;

		// Send the packet to the player if it exists, otherwise broadcast it to the dimension
		player ? player.session.send(packet) : this.dimension.broadcast(packet);

		// Remove the entity from the dimension, only if the player is not null
		if (!player) this.dimension.entities.delete(this.unique);
	}

	/**
	 * Gets a component from the entity.
	 * @param identifier The identifier of the component.
	 * @returns The component that was found.
	 */
	public getComponent<T extends keyof EntityComponents>(
		identifier: T
	): EntityComponents[T] {
		return this.components.get(identifier) as EntityComponents[T];
	}

	/**
	 * Gets all the components of the entity.
	 * @returns All the components of the entity.
	 */
	public getComponents(): Array<EntityComponent> {
		return [...this.components.values()];
	}

	/**
	 * Sets a component to the entity.
	 * @param component The component to set.
	 */
	public setComponent<T extends keyof EntityComponents>(
		component: EntityComponents[T]
	): void {
		this.components.set(component.identifier, component);
	}

	/**
	 * Removes a component from the entity.
	 * @param identifier The identifier of the component.
	 */
	public removeComponent<T extends keyof EntityComponents>(
		identifier: T
	): void {
		this.components.delete(identifier);
	}

	/**
	 * Gets an attribute component from the entity.
	 * @param attribute The attribute to get.
	 * @returns The attribute component that was found.
	 */
	public getAttribute<T extends keyof EntityAttributeComponents>(
		attribute: T
	): EntityAttributeComponents[T] {
		return this.components.get(attribute) as EntityAttributeComponents[T];
	}

	/**
	 * Gets all the attribute components of the entity.
	 * @returns All the attribute components of the entity.
	 */
	public getAttributes(): Array<EntityAttributeComponent> {
		return [...this.components.values()].filter(
			(component): component is EntityAttributeComponent =>
				component instanceof EntityAttributeComponent
		);
	}

	/**
	 * Gets a metadata component from the entity.
	 * @param metadata The metadata to get.
	 * @returns The metadata component that was found.
	 */
	public getMetadata<T extends keyof EntityMetadataComponent>(
		metadata: T
	): EntityMetadataComponent {
		return this.components.get(metadata) as EntityMetadataComponent;
	}

	/**
	 * Gets all the metadata components of the entity.
	 * @returns All the metadata components of the entity.
	 */
	public getMetadatas(): Array<EntityMetadataComponent> {
		return [...this.components.values()].filter(
			(component): component is EntityMetadataComponent =>
				component instanceof EntityMetadataComponent
		);
	}

	public getCardinalDirection(): CardinalDirection {
		// Calculate the cardinal direction of the entity
		// Entity yaw is -180 to 180

		// Calculate the rotation of the entity
		const rotation = (Math.floor(this.rotation.yaw) + 360) % 360;

		// Calculate the cardinal direction
		if (rotation >= 315 || rotation < 45) return CardinalDirection.South;
		if (rotation >= 45 && rotation < 135) return CardinalDirection.West;
		if (rotation >= 135 && rotation < 225) return CardinalDirection.North;
		if (rotation >= 225 && rotation < 315) return CardinalDirection.East;

		return CardinalDirection.South;
	}

	/**
	 * Registers a component to the entity.
	 * @param component The component to register.
	 */
	public static registerComponent(component: typeof EntityComponent): void {
		this.components.push(component);
	}

	/**
	 * Unregisters a component from the entity.
	 * @param component The component to unregister.
	 */
	public static unregisterComponent(component: typeof EntityComponent): void {
		const index = this.components.indexOf(component);
		if (index === -1) return;
		this.components.splice(index, 1);
	}
}

export { Entity };
