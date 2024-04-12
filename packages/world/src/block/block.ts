import {
	type BlockCoordinates,
	BlockFace,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket
} from "@serenityjs/protocol";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";
import { ItemType } from "@serenityjs/item";

import { ItemStack } from "../item";

import type { CardinalDirection } from "../enums";
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
	 * The location of the block.
	 */
	public readonly location: BlockCoordinates;

	/**
	 * The permutation of the block.
	 */
	public permutation: BlockPermutation;

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

		// Set the block permutation.
		this.permutation = permutation;

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
			this.location.z - (steps ?? 1)
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
			this.location.z + (steps ?? 1)
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
	 * Gets the corresponding block next to a given block face of the block.
	 *
	 * @param face The face of the block.
	 */
	public face(face: BlockFace): Block {
		switch (face) {
			case BlockFace.Top: {
				return this.above();
			}
			case BlockFace.Bottom: {
				return this.below();
			}
			case BlockFace.North: {
				return this.north();
			}
			case BlockFace.South: {
				return this.south();
			}
			case BlockFace.East: {
				return this.east();
			}
			case BlockFace.West: {
				return this.west();
			}
		}
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 * @param upsideDown If the block is upside down.
	 */
	// TODO: Add support for minecraft:cardinal_direction states. (chest, furnace, etc.)
	public setDirection(
		direction: CardinalDirection,
		upsideDown?: boolean
	): void {
		// Get the state keys
		const keys = Object.keys(this.permutation.state);

		// Check if the block has a weirdo direction state.
		if (keys.includes("weirdo_direction") && keys.includes("upside_down_bit")) {
			// Get the new permutation with the direction state.
			const permutation = this.permutation.type.getPermutation({
				upside_down_bit: upsideDown ?? false,
				weirdo_direction: direction
			});

			// set the permutation
			this.setPermutation(permutation);
		}
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
