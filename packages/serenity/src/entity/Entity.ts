import type { MetadataDictionary, Vector3f } from '@serenityjs/bedrock-protocol';
import { MetadataFlags, MetadataKey, MetadataType } from '@serenityjs/bedrock-protocol';
import type { Dimension } from '../world/index.js';

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
	public readonly dimension: Dimension; // Should we not store the dimension in the entity? Not sure.
	public readonly position: Vector3f;
	public readonly velocity: Vector3f;
	public readonly rotation: Vector3f;
	public readonly metadata: Map<MetadataFlags | MetadataKey, EntityMetadata>;

	public constructor(identifier: string, dimension: Dimension, uniqueId?: bigint) {
		this.runtimeId = RUNTIME_ID++;
		this.uniqueId = uniqueId ?? BigInt.asIntN(64, BigInt(Math.floor((Math.random() * 256) ^ Number(this.runtimeId))));
		this.identifier = identifier;
		this.dimension = dimension;
		this.position = { x: 0, y: 0, z: 0 };
		this.velocity = { x: 0, y: 0, z: 0 };
		this.rotation = { x: 0, y: 0, z: 0 };
		this.metadata = new Map();
	}

	/**
	 * Get the metadata of the entity.
	 *
	 * @returns The metadata of the entity.
	 */
	public getMetadata(): MetadataDictionary[] {
		// Map and return the metadata.
		return [...this.metadata.entries()].map(([key, value]) => {
			return {
				key: value.flag ? MetadataKey.Flags : (key as MetadataKey),
				type: value.type,
				value: value.value,
				flag: value.flag ? (key as MetadataFlags) : undefined,
			};
		});
	}

	/**
	 * Get the name tag of the entity.
	 *
	 * @returns The name tag of the entity.
	 */
	public getNameTag(): string | null {
		// Get the name tag from the metadata.
		const name = this.metadata.get(MetadataKey.Nametag);

		// Return null if the name is null.
		if (!name) return null;

		// Return the name as a string.
		return name.value as string;
	}

	/**
	 * Set the name tag of the entity.
	 *
	 * @param name - The name tag to set.
	 * @param constant - Whether the name tag is always visible.
	 */
	public setNameTag(name: string, constant = false): void {
		// Set the name tag in the metadata.
		this.metadata.set(MetadataKey.Nametag, { type: MetadataType.String, value: name });

		// Set the constant flag in the metadata.
		this.metadata.set(MetadataFlags.AlwaysShowNametag, {
			type: MetadataType.Long,
			value: constant ? 1n : 0n,
			flag: true,
		});

		// Send the metadata to the world.
		return this.dimension.updateEntity(this);
	}

	/**
	 * Get the Scale of the entity.
	 *
	 * @returns The Scale of the entity.
	 */
	public getScale(): number | null {
		// Get the Scale from the metadata.
		const scale = this.metadata.get(MetadataKey.Scale);

		// Return 1 if the scale is null.
		if (!scale) return null;

		// Return the Scale as a number.
		return scale.value as number;
	}

	/**
	 * Set the Scale of the entity.
	 *
	 * @param scale - The Scale to set.
	 */
	public setScale(scale: number): void {
		// Set the Scale in the metadata.
		this.metadata.set(MetadataKey.Scale, { type: MetadataType.Float, value: scale });

		// Send the metadata to the world.
		return this.dimension.updateEntity(this);
	}

	/**
	 * If the entity is affected by gravity.
	 *
	 * @returns If the entity is affected by gravity.
	 */
	public getGravity(): boolean {
		// Get the flag from the metadata.
		const flag = this.metadata.get(MetadataFlags.AffectedByGravity);

		// Return false if the flag is null.
		if (!flag) return false;

		// Return the flag as a boolean.
		return flag.value as boolean;
	}

	/**
	 * Set the gravity flag of the entity.
	 *
	 * @param value - The value to set.
	 */
	public setGravity(value: boolean): void {
		// Set the flag in the metadata.
		this.metadata.set(MetadataFlags.AffectedByGravity, { type: MetadataType.Long, value: value ? 1n : 0n, flag: true });

		// Send the metadata to the world.
		return this.dimension.updateEntity(this);
	}

	/**
	 * If the entity has collision.
	 *
	 * @returns If the entity has collision.
	 */
	public getCollision(): boolean {
		// Get the flag from the metadata.
		const flag = this.metadata.get(MetadataFlags.HasCollision);

		// Return false if the flag is null.
		if (!flag) return false;

		// Return the flag as a boolean.
		return flag.value as boolean;
	}

	/**
	 * Set the collision flag of the entity.
	 *
	 * @param value - The value to set.
	 */
	public setCollision(value: boolean): void {
		// Set the flag in the metadata.
		this.metadata.set(MetadataFlags.HasCollision, { type: MetadataType.Long, value: value ? 1n : 0n, flag: true });

		// Send the metadata to the world.
		return this.dimension.updateEntity(this);
	}

	public remove(): void {
		this.dimension.despawnEntity(this);
	}
}

export { Entity };
