import {
	type BlockCoordinates,
	BlockFace,
	LevelSoundEvent,
	LevelSoundEventPacket,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket,
	Vector3f
} from "@serenityjs/protocol";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";
import { ItemType } from "@serenityjs/item";

import { ItemStack } from "../item";
import { BlockComponent } from "../components";

import type { BlockComponents } from "../types";
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
	 * The position of the block.
	 */
	public readonly position: BlockCoordinates;

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
	 * @param position The position of the block.
	 */
	public constructor(
		dimension: Dimension,
		permutation: BlockPermutation,
		position: BlockCoordinates
	) {
		this.dimension = dimension;
		this.permutation = permutation;
		this.position = position;
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
		const cx = this.position.x >> 4;
		const cz = this.position.z >> 4;

		// Get the chunk from the dimension.
		return this.dimension.getChunk(cx, cz);
	}

	/**
	 * Checks if the block has a component.
	 * @param identifier The identifier of the component.
	 * @returns Whether or not the block has the component.
	 */
	public hasComponent<T extends keyof BlockComponents>(identifier: T): boolean {
		return this.components.has(identifier);
	}

	/**
	 * Gets the component of the block.
	 * @param identifier The identifier of the component.
	 * @returns The component that was found.
	 */
	public getComponent<T extends keyof BlockComponents>(
		identifier: T
	): BlockComponents[T] {
		return this.components.get(identifier) as BlockComponents[T];
	}

	/**
	 * Gets all the components of the block.
	 * @returns All the components of the block.
	 */
	public getComponents(): Array<BlockComponent> {
		return [...this.components.values()];
	}

	/**
	 * Sets the component of the block.
	 * @param component The component to set.
	 */
	public setComponent<T extends keyof BlockComponents>(
		component: BlockComponents[T]
	): void {
		// Set the component to the block.
		this.components.set(component.identifier, component);

		// Check if the dimension already has the block.
		// If not, we will add it to the cache.
		if (!this.dimension.blocks.has(this.position))
			this.dimension.blocks.set(this.position, this);
	}

	/**
	 * Removes the component from the block.
	 * @param identifier The identifier of the component.
	 */
	public removeComponent<T extends keyof BlockComponents>(identifier: T): void {
		this.components.delete(identifier);
	}

	/**
	 * Clears all the components of the block.
	 */
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

		// Get the x, y, and z coordinates of the block.
		const { x, y, z } = this.position;

		// Get the chunk the block is in.
		const chunk = this.dimension.getChunk(x >> 4, z >> 4);

		// Set the permutation of the block.
		chunk.setPermutation(x, y, z, permutation);

		// Check if the change was initiated by a player.
		// If so, we will play the block place sound.
		if (playerInitiated) {
			// Create a new LevelSoundEventPacket.
			const sound = new LevelSoundEventPacket();

			// Set the packet properties.
			sound.event = LevelSoundEvent.Place;
			sound.position = new Vector3f(x, y, z);
			sound.data = permutation.network;
			sound.actorIdentifier = "";
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Send the packet to the dimension.
			this.dimension.broadcast(sound);
		}

		// Create a new UpdateBlockPacket.
		const update = new UpdateBlockPacket();

		// Set the packet properties.
		update.networkBlockId = permutation.network;
		update.position = this.position;
		update.flags = UpdateBlockFlagsType.Network;
		update.layer = UpdateBlockLayerType.Normal;

		// Send the packet to the dimension.
		this.dimension.broadcast(update);

		// Register the components to the block.
		for (const component of BlockComponent.registry.get(
			permutation.type.identifier
		) ?? [])
			new component(this, component.identifier);

		// Call the onPlace method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockPlacedByPlayer method.
			component.onPlace?.(playerInitiated);
		}

		// Update the block and the surrounding blocks.
		this.update(true);

		// Check if there is an entity on the block.
		for (const entity of this.dimension.entities.values()) {
			// Get the entities position.
			const position = entity.position.floor();

			// Check if the entity is on the same x and z coordinates.
			if (position.x === x && position.z === z) entity.onGround = false;
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
			this.position.x,
			this.position.y + (steps ?? 1),
			this.position.z
		);
	}

	/**
	 * Gets the block below this block.
	 *
	 * @param steps The amount of steps to go down.
	 */
	public below(steps?: number): Block {
		return this.dimension.getBlock(
			this.position.x,
			this.position.y - (steps ?? 1),
			this.position.z
		);
	}

	/**
	 * Gets the block to the north of this block.
	 *
	 * @param steps The amount of steps to go north.
	 */
	public north(steps?: number): Block {
		return this.dimension.getBlock(
			this.position.x,
			this.position.y,
			this.position.z - (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the south of this block.
	 *
	 * @param steps The amount of steps to go south.
	 */
	public south(steps?: number): Block {
		return this.dimension.getBlock(
			this.position.x,
			this.position.y,
			this.position.z + (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the east of this block.
	 *
	 * @param steps The amount of steps to go east.
	 */
	public east(steps?: number): Block {
		return this.dimension.getBlock(
			this.position.x + (steps ?? 1),
			this.position.y,
			this.position.z
		);
	}

	/**
	 * Gets the block to the west of this block.
	 *
	 * @param steps The amount of steps to go west.
	 */
	public west(steps?: number): Block {
		return this.dimension.getBlock(
			this.position.x - (steps ?? 1),
			this.position.y,
			this.position.z
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
		this.dimension.blocks.delete(this.position);

		// Call the onBreak method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockBrokenByPlayer method.
			component.onBreak?.(playerInitiated);
		}
	}

	/**
	 * Updates the block and the surrounding blocks.
	 * @param surrounding If the surrounding blocks should be updated.
	 */
	public update(surrounding = false): void {
		// Call the onUpdate method of the components.
		for (const component of this.components.values()) {
			// Call the onUpdate method.
			component.onUpdate?.();
		}

		// Check if the surrounding blocks should be updated.
		if (surrounding) {
			this.above().update();
			this.below().update();
			this.north().update();
			this.south().update();
			this.east().update();
			this.west().update();
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
