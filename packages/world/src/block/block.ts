import {
	BlockCoordinates,
	LevelEvent,
	LevelEventPacket,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket,
	Vector3f
} from "@serenityjs/protocol";

import { Dimension } from "../world";
import { BlockIdentifier } from "../enums";

import { BlockPermutation } from "./permutation";

class Block {
	/**
	 * The dimension the block is in.
	 */
	public readonly dimension: Dimension;

	/**
	 * If the block is air.
	 */
	public readonly isAir: boolean;

	/**
	 * If the block is liquid.
	 */
	public readonly isLiquid: boolean;

	/**
	 * The permutation of the block.
	 */
	public readonly permutation: BlockPermutation;

	/**
	 * The location of the block.
	 */
	public readonly location: BlockCoordinates;

	/**
	 * Creates a new block.
	 * @param dimension The dimension the block is in.
	 * @param permutation The permutation of the block.
	 * @param location The location of the block.
	 */
	public constructor(
		dimension: Dimension,
		permutation: BlockPermutation,
		location: BlockCoordinates
	) {
		this.dimension = dimension;
		this.isAir = permutation.type.identifier === "minecraft:air";
		this.isLiquid =
			permutation.type.identifier === "minecraft:water" ||
			permutation.type.identifier === "minecraft:lava";
		this.permutation = permutation;
		this.location = location;
	}

	public setPermutation(permutation: BlockPermutation): void {
		// Get the chunk the block is in.
		const chunk = this.dimension.getChunk(
			this.location.x >> 4,
			this.location.z >> 4
		);

		// Set the permutation of the block.
		chunk.setPermutation(
			this.location.x,
			this.location.y,
			this.location.z,
			permutation
		);

		// Create a new UpdateBlockPacket.
		const packet = new UpdateBlockPacket();

		// Set the packet properties.
		packet.blockRuntimeId = this.dimension.world.provider.hashes
			? permutation.hash
			: permutation.runtime;

		packet.position = this.location;
		packet.flags = UpdateBlockFlagsType.Network;
		packet.layer = UpdateBlockLayerType.Normal;

		// Send the packet to the dimension.
		this.dimension.broadcast(packet);
	}

	/**
	 * Gets the block above this block.
	 *
	 * @param steps The amount of steps to go up.
	 */
	public above(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y + (steps ?? 1),
			this.location.z
		);
	}

	/**
	 * Gets the block below this block.
	 *
	 * @param steps The amount of steps to go down.
	 */
	public below(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y - (steps ?? 1),
			this.location.z
		);
	}

	/**
	 * Gets the block to the north of this block.
	 *
	 * @param steps The amount of steps to go north.
	 */
	public north(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y,
			this.location.z + (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the south of this block.
	 *
	 * @param steps The amount of steps to go south.
	 */
	public south(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y,
			this.location.z - (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the east of this block.
	 *
	 * @param steps The amount of steps to go east.
	 */
	public east(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x + (steps ?? 1),
			this.location.y,
			this.location.z
		);
	}

	/**
	 * Gets the block to the west of this block.
	 *
	 * @param steps The amount of steps to go west.
	 */
	public west(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x - (steps ?? 1),
			this.location.y,
			this.location.z
		);
	}

	/**
	 * Destroys the block.
	 */
	public destroy(hideParticles?: boolean): void {
		// Get the air permutation.
		const air = this.dimension.world.blocks.resolvePermutation(
			BlockIdentifier.Air
		);

		// Set the block permutation to air.
		this.setPermutation(air);

		// Check if we should hide the particles.
		if (!hideParticles) {
			// Create a new LevelEventPacket.
			const event = new LevelEventPacket();

			// Set event id
			event.event = LevelEvent.ParticleDestroyBlockNoSound;

			// Set the position of the event.
			event.position = new Vector3f(
				this.location.x,
				this.location.y,
				this.location.z
			);

			// Set the data of the event.
			event.data = this.dimension.world.provider.hashes
				? this.permutation.hash
				: this.permutation.runtime;

			// Broadcast the event to the dimension.
			this.dimension.broadcastImmediate(event);
		}
	}
}

export { Block };
