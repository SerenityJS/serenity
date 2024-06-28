import {
	ActorEventIds,
	ActorEventPacket,
	AddEntityPacket,
	AddItemActorPacket,
	Attribute,
	type AttributeName,
	ChunkCoords,
	MetadataDictionary,
	type MetadataFlags,
	MetadataKey,
	MetadataType,
	MoveActorAbsolutePacket,
	RemoveEntityPacket,
	Rotation,
	SetActorMotionPacket,
	SetEntityDataPacket,
	UpdateAttributesPacket,
	Vector3f
} from "@serenityjs/protocol";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";
import { CommandExecutionState, type CommandResult } from "@serenityjs/command";

import { CardinalDirection } from "../enums";
import { EntityComponent } from "../components";
import { ItemStack } from "../item";

import type { Chunk } from "../chunk";
import type { Player } from "../player";
import type { Dimension, World } from "../world";
import type { EntityComponents } from "../types/components";

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
	public static runtime = 2n; // For some reason, the runtime id needs to start at 2???

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
	public readonly position = new Vector3f(0, 0, 0);

	/**
	 * The velocity of the entity.
	 */
	public readonly velocity = new Vector3f(0, 0, 0);

	/**
	 * The rotation of the entity.
	 */
	public readonly rotation = new Rotation(0, 0, 0);

	/**
	 * The components of the entity.
	 */
	public readonly components = new Map<string, EntityComponent>();

	/**
	 * The metadata of the entity.
	 */
	public readonly metadata = new Set<MetadataDictionary>();

	/**
	 * The attributes of the entity.
	 */
	public readonly attributes = new Set<Attribute>();

	/**
	 * The dimension of the entity.
	 */
	public dimension: Dimension;

	/**
	 * Whether or not the entity is on the ground.
	 */
	public onGround = false;

	/**
	 * Whether or not the entity is alive.
	 */
	public isAlive = true;

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

		// Mutable properties
		this.dimension = dimension;

		// Check if the entity is a player
		if (this.type.identifier === EntityIdentifier.Player) return;

		// Register the type components to the entity.
		for (const component of EntityComponent.registry.get(identifier) ?? [])
			new component(this, component.identifier);
	}

	/**
	 * Syncs the entity and its properties to the dimension.
	 */
	public sync(): void {
		// Syncs the entity data
		this.syncData();

		// Syncs the entity flags
		this.syncFlags();

		// Syncs the entity attributes
		this.syncAttributes();
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
	 * Gets the chunk hashes around the entity.
	 * @param distance The distance to get the chunks.
	 * @returns The chunk hashes around the entity.
	 */
	public getChunks(distance?: number): Array<bigint> {
		// Calculate the chunk position of the entity
		const cx = this.position.x >> 4;
		const cz = this.position.z >> 4;

		// Calculate the distance or use the simulation distance of the dimension
		const dx = (distance ?? this.dimension.simulationDistance) >> 4;
		const dz = (distance ?? this.dimension.simulationDistance) >> 4;

		// Prepare an array to store the chunk hashes
		const hashes: Array<bigint> = [];

		// Get the chunk hashes to render.
		for (let x = -dx + cx; x <= dx + cx; x++) {
			for (let z = -dz + cz; z <= dz + cz; z++) {
				// Get the chunk
				const hash = ChunkCoords.hash({ x, z });

				// Add the hash to the array.
				hashes.push(hash);
			}
		}

		// Return the hashes
		return hashes;
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
			packet.metadata = [...this.metadata.values()];
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
			packet.metadata = [...this.metadata.values()];
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
		// Set the alive property of the entity to false
		this.isAlive = false;

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
	 * Kills the entity, triggering the death animation.
	 */
	public kill(): void {
		// Set the alive property of the entity to false
		this.isAlive = false;

		// TODO: Implement item drops and experience drops

		// TODO: Check for keep inventory gamerule
		if (this.hasComponent("minecraft:inventory")) {
			// Get the inventory component
			const { container } = this.getComponent("minecraft:inventory");

			// Drop the items from the inventory
			for (const [slot, item] of container.storage.entries()) {
				// Check if the item is not valid
				if (!item) continue;

				// Spawn the item in the dimension
				this.dimension.spawnItem(item, this.position);

				// Remove the item from the container
				container.clearSlot(slot);
			}
		}

		// Check if the entity has a health component
		if (this.hasComponent("minecraft:health")) {
			// Get the health component
			const health = this.getComponent("minecraft:health");

			// Set the health to the minimum value
			health.resetToMinValue();
		}

		// Create a new ActorEventPacket
		const packet = new ActorEventPacket();

		// Set the properties of the packet
		packet.eventId = ActorEventIds.DEATH_ANIMATION;
		packet.actorRuntimeId = this.runtime;
		packet.eventData = 0;

		// Broadcast the packet to the dimension
		this.dimension.broadcast(packet);

		// Delete the entity from the dimension if it is not a player
		if (!this.isPlayer()) this.dimension.entities.delete(this.unique);

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
	 * Syncs the metadata of the entity.
	 */
	public syncData(): void {
		// Create a new SetEntityDataPacket
		const packet = new SetEntityDataPacket();
		packet.runtimeEntityId = this.runtime;
		packet.tick = this.dimension.world.currentTick;
		packet.metadata = [...this.metadata.values()];
		packet.properties = {
			ints: [],
			floats: []
		};

		// Send the packet to the dimension
		this.dimension.broadcast(packet);
	}

	/**
	 * Wheather or not the entity contains the metadata key.
	 * @param key The metadata key to check.
	 * @returns Whether or not the entity contains the metadata key.
	 */
	public hasData(key: MetadataKey): boolean {
		return [...this.metadata.values()].some((data) => data.key === key);
	}

	/**
	 * Gets the metadata of the entity.
	 * @param key The metadata key to get.
	 * @returns The metadata of the entity.
	 */
	public getData(key: MetadataKey): MetadataDictionary | undefined {
		return [...this.metadata.values()].find((data) => data.key === key);
	}

	/**
	 * Gets all the metadata of the entity.
	 * @returns All the metadata of the entity.
	 */
	public getAllData(): Array<MetadataDictionary> {
		return [...this.metadata.values()].filter((data) => !data.flag);
	}

	/**
	 * Adds metadata to the entity.
	 * @param data The metadata to add.
	 * @param sync Whether to synchronize the metadata.
	 */
	public addData(data: MetadataDictionary, sync = true): void {
		this.metadata.add(data);

		if (sync) this.syncData();
	}

	/**
	 * Sets the metadata of the entity.
	 * @param key The metadata key to set.
	 * @param value The value to set.
	 * @param sync Whether to synchronize the metadata.
	 */
	public setData(
		key: MetadataKey,
		value: bigint | boolean | number | string,
		sync = true
	): void {
		const data = this.getData(key);

		if (!data) throw new Error(`The entity does not have the ${key} data.`);

		data.value = value;

		if (sync) this.syncData();
	}

	/**
	 * Creates metadata for the entity.
	 * @param key The metadata key to create.
	 * @param value The value to create.
	 * @param type The type of the metadata.
	 * @param sync Whether to synchronize the metadata.
	 */
	public createData(
		key: MetadataKey,
		value: bigint | boolean | number | string,
		type: MetadataType,
		sync = true
	): void {
		// Create a new MetadataDictionary
		const data = new MetadataDictionary(key, type, value);

		// Add the data to the entity
		this.addData(data, sync);
	}

	/**
	 * Removes metadata from the entity.
	 * @param key The metadata key to remove.
	 * @param sync Whether to synchronize the metadata.
	 */
	public removeData(key: MetadataKey, sync = true): void {
		// Check if the entity has the metadata key
		const data = this.getData(key);

		// Check if the data is not found
		if (!data) return;

		// Remove the data from the entity
		this.metadata.delete(data);

		// Synchronize the metadata
		if (sync) this.syncData();
	}

	/**
	 * Syncs the metadata flags of the entity.
	 */
	public syncFlags(): void {
		// Create a new SetEntityDataPacket
		const packet = new SetEntityDataPacket();
		packet.runtimeEntityId = this.runtime;
		packet.tick = this.dimension.world.currentTick;
		packet.metadata = [...this.metadata.values()];
		packet.properties = {
			ints: [],
			floats: []
		};

		// Send the packet to the dimension
		this.dimension.broadcast(packet);
	}

	/**
	 * Wheather or not the entity contains the metadata flag.
	 * @param flag The metadata flag to check.
	 * @returns Whether or not the entity contains the metadata flag.
	 */
	public hasFlag(flag: MetadataFlags): boolean {
		return [...this.metadata.values()].some((data) => data.flag === flag);
	}

	/**
	 * Gets the metadata flag of the entity.
	 * @param flag The metadata flag to get.
	 * @returns The metadata flag of the entity.
	 */
	public getFlag(flag: MetadataFlags): MetadataDictionary | undefined {
		return [...this.metadata.values()].find((data) => data.flag === flag);
	}

	/**
	 * Gets all the metadata flags of the entity.
	 * @returns All the metadata flags of the entity.
	 */
	public getAllFlags(): Array<MetadataDictionary> {
		return [...this.metadata.values()].filter((data) => data.flag);
	}

	/**
	 * Adds a metadata flag to the entity.
	 * @param data The metadata flag to add.
	 * @param sync Whether to synchronize the metadata.
	 */
	public addFlag(data: MetadataDictionary, sync = true): void {
		this.metadata.add(data);

		if (sync) this.syncFlags();
	}

	/**
	 * Sets the metadata flag of the entity.
	 * @param flag The metadata flag to set.
	 * @param value The value to set.
	 * @param sync Whether to synchronize the metadata.
	 */
	public setFlag(flag: MetadataFlags, value: boolean, sync = true): void {
		const data = this.getFlag(flag);

		if (!data) throw new Error(`The entity does not have the ${flag} flag.`);

		data.value = value;

		if (sync) this.syncFlags();
	}

	/**
	 * Creates a metadata flag for the entity.
	 * @param flag The metadata flag to create.
	 * @param value The value to create.
	 * @param type The type of the metadata.
	 * @param sync Whether to synchronize the metadata.
	 */
	public createFlag(flag: MetadataFlags, value: boolean, sync = true): void {
		// Create a new MetadataDictionary
		const data = new MetadataDictionary(
			MetadataKey.Flags,
			MetadataType.Long,
			value,
			flag
		);

		// Add the data to the entity
		this.addFlag(data, sync);
	}

	/**
	 * Removes a metadata flag from the entity.
	 * @param flag The metadata flag to remove.
	 * @param sync Whether to synchronize the metadata.
	 */
	public removeFlag(flag: MetadataFlags, sync = true): void {
		// Check if the entity has the metadata flag
		const data = this.getFlag(flag);

		// Check if the data is not found
		if (!data) return;

		// Remove the data from the entity
		this.metadata.delete(data);

		// Synchronize the metadata
		if (sync) this.syncFlags();
	}

	/**
	 * Syncs the attributes of the entity.
	 */
	public syncAttributes(): void {
		// Create a new UpdateAttributesPacket
		const packet = new UpdateAttributesPacket();
		packet.runtimeActorId = this.runtime;
		packet.tick = this.dimension.world.currentTick;
		packet.attributes = [...this.attributes];

		// Broadcast the packet to the dimension
		this.dimension.broadcast(packet);
	}

	/**
	 * Checks if the entity has an attribute.
	 * @param name The name of the attribute.
	 * @returns Whether or not the entity has the attribute.
	 */
	public hasAttribute(name: AttributeName): boolean {
		return [...this.attributes.values()].some(
			(attribute) => attribute.name === name
		);
	}

	/**
	 * Gets an attribute from the entity.
	 * @param name The name of the attribute.
	 * @returns The attribute that was found.
	 */
	public getAttribute(name: AttributeName): Attribute | undefined {
		return [...this.attributes.values()].find(
			(attribute) => attribute.name === name
		);
	}

	/**
	 * Gets all the attributes of the entity.
	 * @returns All the attributes of the entity.
	 */
	public getAttributes(): Array<Attribute> {
		return [...this.attributes];
	}

	/**
	 * Adds an attribute to the entity.
	 * @param attribute The attribute to add.
	 * @param sync Whether to synchronize the attributes.
	 */
	public addAttribute(attribute: Attribute, sync = true): void {
		this.attributes.add(attribute);

		if (sync) this.syncAttributes();
	}

	/**
	 * Sets the attribute of the entity.
	 * @param name The name of the attribute.
	 * @param value The value to set.
	 * @param sync Whether to synchronize the attributes.
	 */
	public setAttribute(name: AttributeName, value: number, sync = true): void {
		const attribute = this.getAttribute(name);

		if (!attribute) return;

		attribute.current = value;

		if (sync) this.syncAttributes();
	}

	/**
	 * Creates an attribute for the entity.
	 * @param name The name of the attribute.
	 * @param value The value to create.
	 * @param defaultValue The default value of the attribute.
	 * @param maxValue The maximum value of the attribute.
	 * @param minValue The minimum value of the attribute.
	 * @param sync Whether to synchronize the attributes.
	 * @returns The attribute that was created.
	 */
	public createAttribute(
		name: AttributeName,
		value: number,
		defaultValue: number,
		maxValue: number,
		minValue: number,
		sync = true
	): Attribute {
		const attribute = new Attribute(
			value,
			defaultValue,
			maxValue,
			minValue,
			[],
			name
		);

		this.addAttribute(attribute, sync);

		return attribute;
	}

	/**
	 * Removes an attribute from the entity.
	 * @param name The name of the attribute.
	 */
	public removeAttribute(name: AttributeName, sync = true): void {
		const attribute = this.getAttribute(name);

		if (!attribute) return;

		this.attributes.delete(attribute);

		if (sync) this.syncAttributes();
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

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		this.position.z += this.velocity.z;

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
	 * Applies an impulse to the entity.
	 * @param vector The impulse to apply.
	 */
	public applyImpulse(vector: Vector3f): void {
		// Update the velocity of the entity
		this.velocity.x += vector.x;
		this.velocity.y += vector.y;
		this.velocity.z += vector.z;

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
