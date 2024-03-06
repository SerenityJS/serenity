import type { MetadataDictionary, MetadataFlags, MetadataType } from '@serenityjs/bedrock-protocol';
import { Vector3f, MetadataKey, AddEntity, RemoveEntity } from '@serenityjs/bedrock-protocol';
import type { Player } from '../index.js';
import type { EntityComponents } from '../types/index.js';
import type { Dimension } from '../world/index.js';
import type { EntityComponent } from './components/index.js';
import { EntityMetaComponent } from './components/meta/index.js';

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
		this.components.set(component.identifier, component);
	}

	/**
	 * Gets the metadata components from the entity.
	 *
	 * @returns The metadata components.
	 */
	public getMetadata(): EntityMetaComponent[] {
		return [...this.components.values()].filter(
			(component): component is EntityMetaComponent => component instanceof EntityMetaComponent,
		);
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
		packet.metadata = this.getMetadata().map((entry) => {
			return {
				key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
				type: entry.type,
				value: entry.currentValue,
				flag: entry.flag ? (entry.key as MetadataFlags) : undefined,
			};
		});
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
