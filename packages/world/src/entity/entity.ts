import {
	AddEntityPacket,
	AddItemActorPacket,
	type MetadataFlags,
	MetadataKey,
	MoveActorAbsolutePacket,
	RemoveEntityPacket,
	Rotation,
	SetActorMotionPacket,
	Vector3f
} from "@serenityjs/protocol";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";
import { CommandExecutionState, type CommandResult } from "@serenityjs/command";

import { CardinalDirection } from "../enums";
import {
	EntityAttributeComponent,
	EntityComponent,
	EntityMetadataComponent
} from "../components";
import { ItemStack } from "../item";

import type { Chunk } from "../chunk";
import type { Player } from "../player";
import type { Dimension, World } from "../world";
import type {
	EntityAttributeComponents,
	EntityComponents
} from "../types/components";

/**
 * Represents an entity in a Dimension instance that can be interacted with. Entities can be spawned from either creating a new Entity instance, or using the ".spawnEntity" method of a Dimension instance.
 *
 * **Example Usage**
 * ```typescript
	import { EntityIdentifier } from "@serenityjs/entity";
	import { Vector3f } from "@serenityjs/protocol";
	import { Dimension } from "@serenityjs/world";

	// Declare the Dimension instance, this can be retrieved from the current World instance.
	const dimension: Dimension;

	// This is an example of creating a new entity instance
	const entity = new Entity(EntityIdentifier.Cow, dimension);

	// This is an example of spawning an entity using the ".spawnEntity" method of a Dimension instance
	const entity = dimension.spawnEntity(EntityIdentifier.Cow, new Vector3f(0, 0, 0));

	// Spawn the entity in the dimension
	entity.spawn();
 * ```
 */
class Entity {
	/**
	 * The running total of the entity runtime id.
	 */
	public static runtime = 1n;

	/**
	 * The type of entity.
	 */
	public readonly type: EntityType;

	/**
	 * The runtime id of the entity.
	 */
	public readonly runtime: bigint;

	/**
	 * The unique id of the entity.
	 */
	public readonly unique: bigint;

	/**
	 * The position of the entity.
	 */
	public readonly position: Vector3f;

	/**
	 * The velocity of the entity.
	 */
	public readonly velocity: Vector3f;

	/**
	 * The rotation of the entity.
	 */
	public readonly rotation: Rotation;

	/**
	 * The components of the entity.
	 */
	public readonly components: Map<string, EntityComponent>;

	/**
	 * The dimension of the entity.
	 */
	public dimension: Dimension;

	/**
	 * Whether or not the entity is on the ground.
	 */
	public onGround = false;

	public constructor(
		identifier: EntityIdentifier,
		dimension: Dimension,
		uniqueId?: bigint
	) {
		// Readonly properties
		this.type = EntityType.get(identifier) as EntityType;
		this.runtime = Entity.runtime++;
		this.unique =
			uniqueId ?? (BigInt(Date.now()) << 32n) | (this.runtime << 4n);
		this.position = new Vector3f(0, 0, 0);
		this.velocity = new Vector3f(0, 0, 0);
		this.rotation = new Rotation(0, 0, 0);
		this.components = new Map();

		// Mutable properties
		this.dimension = dimension;

		// Register the type components to the entity.
		for (const component of EntityComponent.registry.get(identifier) ?? [])
			new component(this, component.identifier);
	}

	/**
	 * Checks if the entity is a player.
	 * @returns Whether or not the entity is a player.
	 */
	public isPlayer(): this is Player {
		return this.type.identifier === EntityIdentifier.Player;
	}

	/**
	 * Checks if the entity is an item.
	 * @returns Whether or not the entity is an item.
	 */
	public isItem(): boolean {
		return this.type.identifier === EntityIdentifier.Item;
	}

	/**
	 * Gets the current chunk the entity is in.
	 * @returns The chunk the entity is in.
	 */
	public getChunk(): Chunk {
		// Calculate the chunk position of the entity
		const cx = Math.round(this.position.x >> 4);
		const cz = Math.round(this.position.z >> 4);

		// Return the chunk the entity is in
		return this.dimension.getChunk(cx, cz);
	}

	/**
	 * Gets the chunks around the entity.
	 * @param distance The distance to get the chunks.
	 * @returns The chunks around the entity.
	 */
	public getChunks(distance?: number): Array<Chunk> {
		// Calculate the chunk position of the entity
		const cx = this.position.x >> 4;
		const cz = this.position.z >> 4;

		// Calculate the distance or use the simulation distance of the dimension
		const dx = (distance ?? this.dimension.simulationDistance) >> 4;
		const dz = (distance ?? this.dimension.simulationDistance) >> 4;

		// Prepare an array to store the chunks that need to be sent to the player.
		const chunks: Array<Chunk> = [];

		// Get the chunks to render.
		for (let x = -dx + cx; x <= dx + cx; x++) {
			for (let z = -dz + cz; z <= dz + cz; z++) {
				// Get the chunk
				const chunk = this.dimension.getChunk(x, z);

				// Add the chunk to the array.
				chunks.push(chunk);
			}
		}

		// Return the chunks
		return chunks;
	}

	/**
	 * Gets the world the entity is in.
	 * @returns The world the entity is in.
	 */
	public getWorld(): World {
		return this.dimension.world;
	}

	/**
	 * Executes a command on the entity.
	 * @param command The command to execute.
	 * @returns The result of the command.
	 */
	public executeCommand(command: string): CommandResult | undefined {
		// Check if the command doesnt start with /
		// If so, add it
		if (!command.startsWith("/")) command = `/${command}`;

		// Create a new command execute state
		const state = new CommandExecutionState(
			this.dimension.world.commands,
			command,
			this
		);

		// Try and execute the command
		try {
			// Return the result of the command
			return state.execute();
		} catch (reason) {
			// Check if the entity is a player
			if (this.isPlayer()) {
				this.dimension.world.logger.error(
					`Failed to execute command '${command}' for player '${this.username}':`,
					reason
				);
			} else {
				// Log the error to the console
				this.dimension.world.logger.error(
					`Failed to execute command '${command}' for ${this.type.identifier} entity '${this.unique}':`,
					reason
				);
			}
		}
	}

	/**
	 * Spawns the entity in the world.
	 * @param player The player to spawn the entity to.
	 */
	public spawn(player?: Player): void {
		// Check if the entity is an item
		if (this.isItem()) {
			// Get the item component
			const itemComponent = this.getComponent("minecraft:item");

			// Create a new AddItemActorPacket
			const packet = new AddItemActorPacket();

			// Set the packet properties
			packet.uniqueId = this.unique;
			packet.runtimeId = this.runtime;
			packet.item = ItemStack.toNetworkStack(itemComponent.itemStack);
			packet.position = this.position;
			packet.velocity = this.velocity;
			packet.metadata = this.getMetadatas().map((entry) => {
				return {
					key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
					type: entry.type,
					value: entry.currentValue,
					flag: entry.flag ? (entry.key as MetadataFlags) : undefined
				};
			});
			packet.fromFishing = false;

			// Send the packet to the player if it exists, otherwise broadcast it to the dimension
			player ? player.session.send(packet) : this.dimension.broadcast(packet);
		} else {
			// Create a new AddEntityPacket
			const packet = new AddEntityPacket();

			// Set the packet properties
			packet.uniqueEntityId = this.unique;
			packet.runtimeId = this.runtime;
			packet.identifier = this.type.identifier;
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
		}

		// Add the entity to the dimension
		this.dimension.entities.set(this.unique, this);

		// Trigger the onSpawn method of all applicable components
		for (const component of this.getComponents()) component.onSpawn?.();
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

		// Remove the entity from the dimension, only if the player is not null
		if (!player) this.dimension.entities.delete(this.unique);

		// Send the packet to the player if it exists, otherwise broadcast it to the dimension
		player ? player.session.send(packet) : this.dimension.broadcast(packet);

		// Trigger the onDespawn method of all applicable components
		for (const component of this.getComponents()) component.onDespawn?.();
	}

	/**
	 * Checks if the entity has a component.
	 * @param identifier The identifier of the component.
	 * @returns Whether or not the entity has the component.
	 */
	public hasComponent<T extends keyof EntityComponents>(
		identifier: T
	): boolean {
		return this.components.has(identifier);
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

	/**
	 * Gets the cardinal direction of the entity.
	 * @returns The cardinal direction of the entity.
	 */
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
	 * Sets the position of the entity.
	 * @param vector The position to set.
	 */
	public setMotion(vector?: Vector3f): void {
		// Update the velocity of the entity
		this.velocity.x = vector?.x ?? this.velocity.x;
		this.velocity.y = vector?.y ?? this.velocity.y;
		this.velocity.z = vector?.z ?? this.velocity.z;

		// Set the onGround property of the entity
		this.onGround = false;

		// Create a new SetActorMotionPacket
		const packet = new SetActorMotionPacket();

		// Set the properties of the packet
		packet.runtimeId = this.runtime;
		packet.motion = this.velocity;
		packet.tick = this.dimension.world.currentTick;

		// Broadcast the packet to the dimension
		this.dimension.broadcast(packet);
	}

	/**
	 * Adds motion to the entity.
	 * @param vector The motion to add.
	 */
	public addMotion(vector: Vector3f): void {
		// Update the velocity of the entity
		this.velocity.x += vector.x;
		this.velocity.y += vector.y;
		this.velocity.z += vector.z;

		// Set the motion of the entity
		this.setMotion();
	}

	/**
	 * Clears the motion of the entity.
	 */
	public clearMotion(): void {
		this.velocity.x = 0;
		this.velocity.y = 0;
		this.velocity.z = 0;

		// Set the motion of the entity
		this.setMotion();
	}

	/**
	 * Teleports the entity to a position.
	 * @param position The position to teleport to.
	 * @param dimension The dimension to teleport to.
	 */
	public teleport(position: Vector3f, dimension?: Dimension): void {
		// Set the position of the entity
		this.position.x = position.x;
		this.position.y = position.y;
		this.position.z = position.z;

		// Check if a dimension was provided
		if (dimension) {
			// Despawn the entity from the current dimension
			this.despawn();

			// Set the dimension of the entity
			this.dimension = dimension;

			// Spawn the entity in the new dimension
			this.spawn();
		} else {
			// Create a new MoveActorAbsolutePacket
			const packet = new MoveActorAbsolutePacket();

			// Set the properties of the packet
			packet.runtimeId = this.runtime;
			packet.flags = 1;
			packet.position = position;
			packet.rotation = this.rotation;

			// Broadcast the packet to the dimension
			this.dimension.broadcast(packet);
		}
	}
}

export { Entity };
