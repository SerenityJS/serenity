import {
	type BlockCoordinates,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket
} from "@serenityjs/protocol";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";
import { ItemType } from "@serenityjs/item";

import { ItemStack } from "../item";

import type { Dimension } from "../world";

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

	/**
	 * Sets the permutation of the block.
	 * @param permutation The permutation to set.
	 */
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
		packet.networkBlockId = permutation.network;

		packet.position = this.location;
		packet.flags = UpdateBlockFlagsType.Network;
		packet.layer = UpdateBlockLayerType.Normal;

		// Send the packet to the dimension.
		this.dimension.broadcast(packet);
	}

	/**
	 * Gets the item stack of the block.
	 * @param amount The amount of items in the stack.
	 */
	public getItemStack(amount?: number): ItemStack {
		// Get the item type of the block.
		const type = ItemType.resolve(this.permutation.type) as ItemType;

		// Create a new ItemStack.
		return ItemStack.create(type, amount ?? 1, this.permutation.index);
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
	public destroy(): void {
		// Get the air permutation.
		const air = BlockPermutation.resolve(BlockIdentifier.Air);

		// Set the block permutation to air.
		this.setPermutation(air);
	}
}

export { Block };
