import type { MetadataDictionary, MetadataFlags } from '@serenityjs/bedrock-protocol';
import { Vector3f, MetadataKey, MetadataType, AddEntity, RemoveEntity } from '@serenityjs/bedrock-protocol';
import type { Player } from '../index.js';
import type { EntityComponents } from '../types/index.js';
import type { Dimension } from '../world/index.js';
import type { EntityComponent } from './components/index.js';

let RUNTIME_ID = 1n;

interface EntityMetadata {
	flag?: boolean;
	type: MetadataType;
	value: bigint | boolean | number | string;
}

class Entity {
	public readonly runtimeId: bigint;
	public readonly uniqueId: bigint;
	public readonly identifier: string;
	public readonly dimension: Dimension;
	public readonly position: Vector3f;
	public readonly velocity: Vector3f;
	public readonly rotation: Vector3f;
	public readonly metadata: Map<MetadataFlags | MetadataKey, EntityMetadata>;
	public readonly properties: Map<string, bigint | number | string>;
	public readonly components: Map<string, EntityComponent>; // TODO: Probably should merge properties into components.

	public constructor(identifier: string, dimension: Dimension, uniqueId?: bigint) {
		this.runtimeId = RUNTIME_ID++;
		this.uniqueId = uniqueId ?? BigInt.asIntN(64, BigInt(Math.floor((Math.random() * 256) ^ Number(this.runtimeId))));
		this.identifier = identifier;
		this.dimension = dimension;
		this.position = new Vector3f(0, 0, 0);
		this.velocity = new Vector3f(0, 0, 0);
		this.rotation = new Vector3f(0, 0, 0);
		this.metadata = new Map();
		this.properties = new Map();
		this.components = new Map();
	}
	/**
	 * Gets the component from the entity.
	 *
	 * @param type - The type of the component.
	 * @returns The component.
	 */
	public getComponent<T extends keyof EntityComponents>(type: T): EntityComponents[T] {
		return this.components.get(type) as EntityComponents[T];
	}

	/**
	 * Sets the component to the entity.
	 *
	 * @param component - The component to set.
	 */
	public setComponent<T extends keyof EntityComponents>(component: EntityComponents[T]): void {
		this.components.set(component.type, component);
	}

	/**
	 * Gets the metadata value from the metadata map.
	 *
	 * @returns The metadata dictionary.
	 */
	public getMetadataDictionary(): MetadataDictionary[] {
		return [...this.metadata.entries()].map(([key, value]) => {
			return {
				key: value.flag ? MetadataKey.Flags : (key as MetadataKey),
				type: value.type,
				value: value.value,
				flag: value.flag ? (key as MetadataFlags) : undefined,
			};
		});
	}

	// TODO: Make Component
	/**
	 * The variant of the entity.
	 */
	public get variant(): number {
		// Get the variant from the metadata.
		const varint = this.metadata.get(MetadataKey.Variant);

		// Return 0 if the varint is null.
		if (!varint) return Number();

		// Return the varint as a number.
		return varint.value as number;
	}

	// TODO: Make Component
	/**
	 * Set the variant of the entity.
	 */
	public set variant(value: number) {
		// Set the variant in the metadata.
		this.metadata.set(MetadataKey.Variant, { type: MetadataType.Int, value });

		// Send the metadata to the world.
		this.dimension.updateEntity(this);
	}

	// TODO: Make Component
	/**
	 * The name tag of the entity.
	 */
	public get nametag(): string {
		// Get the name tag from the metadata.
		const name = this.metadata.get(MetadataKey.Nametag);

		// Return an empty string if the name is null.
		if (!name) return String();

		// Return the name as a string.
		return name.value as string;
	}

	// TODO: Make Component
	/**
	 * Set the name tag of the entity.
	 */
	public set nametag(value: string) {
		// Set the name tag in the metadata.
		this.metadata.set(MetadataKey.Nametag, { type: MetadataType.String, value });

		// Send the metadata to the world.
		this.dimension.updateEntity(this);
	}

	// TODO: Make Component
	/**
	 * The scale of the entity.
	 */
	public get scale(): number {
		// Get the scale from the metadata.
		const scale = this.metadata.get(MetadataKey.Scale);

		// Return 1 if the scale is null.
		if (!scale) return Number(1);

		// Return the scale as a number.
		return scale.value as number;
	}

	// TODO: Make Component
	/**
	 * Set the scale of the entity.
	 */
	public set scale(value: number) {
		// Set the scale in the metadata.
		this.metadata.set(MetadataKey.Scale, { type: MetadataType.Float, value });

		// Send the metadata to the world.
		this.dimension.updateEntity(this);
	}

	/**
	 * Spawns the entity into the world.
	 * If a player is provided, the entity will only be sent to the player.
	 *
	 * @param player - The player to send the entity to.
	 */
	public spawn(player?: Player): void {
		// Create a new AddEntity packet.
		const packet = new AddEntity();

		// Assign packet data.
		packet.uniqueEntityId = this.uniqueId;
		packet.runtimeId = this.runtimeId;
		packet.identifier = this.identifier;
		packet.position = this.position;
		packet.velocity = this.velocity;
		packet.rotation = this.rotation;
		packet.bodyYaw = this.rotation.y;
		packet.attributes = [];
		packet.metadata = this.getMetadataDictionary();
		packet.properties = {
			ints: [],
			floats: [],
		};
		packet.links = [];

		// Check if the player is provided.
		// If so, then we will only send the packet to the player.
		if (player) {
			// Send the packet to the player.
			player.session.send(packet);
		} else {
			// Broadcast the packet to the dimension.
			this.dimension.broadcast(packet);

			// Add the entity to the dimension entities map.
			this.dimension.entities.set(this.uniqueId, this);
		}
	}

	/**
	 * Despawns the entity from the world.
	 */
	public despawn(): void {
		// Create a new RemoveEntity packet.
		const packet = new RemoveEntity();

		// Assign packet data.
		packet.uniqueEntityId = this.uniqueId;

		// Broadcast the packet to the dimension.
		this.dimension.broadcast(packet);

		// Remove the entity from the dimension entities map.
		this.dimension.entities.delete(this.uniqueId);
	}
}

export { Entity };
