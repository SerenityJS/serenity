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
import { BlockComponent } from "../components";

import type { Chunk } from "../chunk";
import type { Player } from "../player";
import type { CardinalDirection } from "../enums";
import type { Dimension } from "../world";

class Block {
	/**
	 * The dimension the block is in.
	 */
	public readonly dimension: Dimension;

	/**
	 * The location of the block.
	 */
	public readonly location: BlockCoordinates;

	/**
	 * The components of the block.
	 */
	public readonly components: Map<string, BlockComponent>;

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
		this.permutation = permutation;
		this.location = location;
		this.components = new Map();
	}

	/**
	 * If the block is air.
	 */
	public isAir(): boolean {
		return this.permutation.type.identifier === "minecraft:air";
	}

	/**
	 * If the block is liquid.
	 */
	public isLiquid(): boolean {
		return (
			this.permutation.type.identifier === "minecraft:water" ||
			this.permutation.type.identifier === "minecraft:lava"
		);
	}

	/**
	 * Gets the chunk the block is in.
	 * @returns The chunk the block is in.
	 */
	public getChunk(): Chunk {
		// Calculate the chunk coordinates.
		const cx = this.location.x >> 4;
		const cz = this.location.z >> 4;

		// Get the chunk from the dimension.
		return this.dimension.getChunk(cx, cz);
	}

	// TODO: setup component methods

	public getComponents(): Array<BlockComponent> {
		return [...this.components.values()];
	}

	public setComponent(component: BlockComponent): void {
		// Set the component to the block.
		this.components.set(component.identifier, component);

		// Check if the dimension already has the block.
		// If not, we will add it to the cache.
		if (!this.dimension.blocks.has(Block.getHash(this.location)))
			this.dimension.blocks.set(Block.getHash(this.location), this);
	}

	public clearComponents(): void {
		this.components.clear();
	}

	/**
	 * Sets the permutation of the block.
	 * @param permutation The permutation to set.
	 * @param playerInitiated If the change was initiated by a player.
	 */
	public setPermutation(
		permutation: BlockPermutation,
		playerInitiated?: Player
	): Block {
		// Clear the previous components.
		this.components.clear();

		// Set the permutation of the block.
		this.permutation = permutation;

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

		// Register the components to the block.
		for (const component of BlockComponent.registry.get(permutation.type) ?? [])
			new component(this, component.identifier);

		// Call the onPlace method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockPlacedByPlayer method.
			component.onPlace?.(playerInitiated);
		}

		// Check if there is an entity on the block.
		for (const entity of this.dimension.entities.values()) {
			// Get the entities position.
			const position = entity.position.floor();

			// Check if the entity is on the same x and z coordinates.
			if (position.x === this.location.x && position.z === this.location.z)
				entity.onGround = false;
		}

		// Return the block.
		return this;
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
	public destroy(playerInitiated?: Player): void {
		// Get the air permutation.
		const air = BlockPermutation.resolve(BlockIdentifier.Air);

		// Set the block permutation to air.
		this.setPermutation(air);

		// Since the block is becoming air, we can remove the block from the dimension cache to save memory.
		this.dimension.blocks.delete(Block.getHash(this.location));

		// Call the onBreak method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockBrokenByPlayer method.
			component.onBreak?.(playerInitiated);
		}
	}

	/**
	 * Gets the hash of the block.
	 * @param coordinates The coordinates of the block.
	 */
	public static getHash(coordinates: BlockCoordinates): bigint {
		return (
			((BigInt(coordinates.x) & 0xff_ff_ff_ffn) << 32n) |
			(BigInt(coordinates.z) & 0xff_ff_ff_ffn) |
			BigInt(coordinates.y)
		);
	}
}

export { Block };
