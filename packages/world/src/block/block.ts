import {
	BlockActorDataPacket,
	type BlockCoordinates,
	BlockFace,
	LevelSoundEvent,
	LevelSoundEventPacket,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket,
	Vector3f
} from "@serenityjs/protocol";
import {
	BlockPermutation,
	BlockIdentifier,
	type BlockType
} from "@serenityjs/block";
import { ItemIdentifier, ItemType } from "@serenityjs/item";
import { CompoundTag } from "@serenityjs/nbt";

import { ItemStack } from "../item";
import { BlockComponent, BlockStateComponent } from "../components";

import type { BlockComponents, BlockUpdateOptions } from "../types";
import type { Chunk } from "../chunk";
import type { Player } from "../player";
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
	public readonly components = new Map<string, BlockComponent>();

	/**
	 * The NBT data of the block.
	 */
	public nbt = new CompoundTag("", {});

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
	}

	/**
	 * Whether or not the block is air.
	 */
	public isAir(): boolean {
		return this.permutation.type.air;
	}

	/**
	 * Whether or not the block is liquid.
	 */
	public isLiquid(): boolean {
		return this.permutation.type.liquid;
	}

	/**
	 * Whether or not the block is solid.
	 */
	public isSolid(): boolean {
		return this.permutation.type.solid;
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
	 * @param options The options of the block update.
	 */
	public setPermutation(
		permutation: BlockPermutation,
		options?: BlockUpdateOptions
	): Block {
		// Clear the previous components.
		if (this.permutation.type !== permutation.type) this.clearComponents();

		// Set the permutation of the block.
		this.permutation = permutation;

		// Get the x, y, and z coordinates of the block.
		const { x, y, z } = this.position;

		// Get the chunk the block is in.
		const chunk = this.dimension.getChunk(x >> 4, z >> 4);

		// Set the permutation of the block.
		chunk.setPermutation(x, y, z, permutation);

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

		// Register the components that are type specific.
		for (const identifier of permutation.type.components) {
			// Get the component from the registry
			const component = BlockComponent.components.get(identifier);

			// Check if the component exists.
			if (component) new component(this, identifier);
		}

		// Register the components that are state specific.
		for (const key of Object.keys(permutation.state)) {
			// Get the component from the registry
			const component = [...BlockComponent.components.values()].find((x) => {
				// If the identifier is undefined, we will skip it.
				if (!x.identifier || !(x.prototype instanceof BlockStateComponent))
					return false;

				// Initialize the component as a BlockStateComponent.
				const component = x as typeof BlockStateComponent;

				// Check if the identifier includes the key.
				// As some states dont include a namespace.
				return component.state === key;
			});

			// Check if the component exists.
			if (component) new component(this, key);
		}

		// Check if the change was initiated by a player.
		// If so, we will play the block place sound.
		if (options && options.player) {
			// Get the clicked position of the player.
			const clickedPosition = options.clickPosition ?? new Vector3f(0, 0, 0);

			// Call the onPlace method of the components.
			for (const component of this.components.values()) {
				// Call the onBlockPlacedByPlayer method.
				component.onPlace?.(options.player, clickedPosition);
			}

			// Create a new LevelSoundEventPacket.
			const sound = new LevelSoundEventPacket();

			// Set the packet properties.
			sound.event = LevelSoundEvent.Place;
			sound.position = new Vector3f(x, y, z);
			sound.data = permutation.network;
			sound.actorIdentifier = String();
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Send the packet to the dimension.
			this.dimension.broadcast(sound);
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
	 * Gets the type of the block
	 * @returns The type of the block.
	 */
	public getType(): BlockType {
		return this.permutation.type;
	}

	/**
	 * Sets the type of the block.
	 * @param type The type of the block.
	 * @param playerInitiated If the change was initiated by a player.
	 */
	public setType(type: BlockType, options?: BlockUpdateOptions): Block {
		// Get the permutation of the block.
		const permutation = type.getPermutation();

		// Set the permutation of the block.
		this.setPermutation(permutation, { player: options?.player });

		// Return the block.
		return this;
	}

	/**
	 * Gets the tags of the block.
	 * @returns The tags of the block.
	 */
	public getTags(): Array<string> {
		return this.permutation.type.tags;
	}

	/**
	 * Checks if the block has a tag.
	 * @param tag The tag to check.
	 * @returns Whether or not the block has the tag.
	 */
	public hasTag(tag: string): boolean {
		return this.permutation.type.tags.includes(tag);
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
	 * Gets the tool required to break the block.
	 * @returns The tool required to break the block.
	 */
	public getTool(): ItemIdentifier {
		// Get the tags of the block.
		const tags = this.getTags().sort((a, b) => b.localeCompare(a));

		// Iterate over the tags.
		for (const tag of tags) {
			switch (tag) {
				case "wooden_axe_diggable": {
					return ItemIdentifier.WoodenAxe;
				}

				case "stone_pick_diggable": {
					return ItemIdentifier.StonePickaxe;
				}

				case "iron_pick_diggable": {
					return ItemIdentifier.IronPickaxe;
				}

				case "golden_pick_diggable": {
					return ItemIdentifier.GoldenPickaxe;
				}

				case "diamond_pick_diggable": {
					return ItemIdentifier.DiamondPickaxe;
				}

				case "netherite_pick_diggable": {
					return ItemIdentifier.NetheritePickaxe;
				}
			}
		}

		// Return the default tool.
		return ItemIdentifier.Air;
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
	 * Destroys the block.
	 * @param playerInitiated If the block was destroyed by a player.
	 */
	public destroy(playerInitiated?: Player): void {
		// Call the onBreak method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockBrokenByPlayer method.
			component.onBreak?.(playerInitiated);
		}

		// Get the air permutation.
		const air = BlockPermutation.resolve(BlockIdentifier.Air);

		// Set the block permutation to air.
		this.setPermutation(air);

		// Since the block is becoming air, we can remove the block from the dimension cache to save memory.
		this.dimension.blocks.delete(this.position);
	}

	/**
	 * Updates the block and the surrounding blocks.
	 * @param surrounding If the surrounding blocks should be updated.
	 */
	public update(surrounding = false, source?: Block): void {
		// Call the onUpdate method of the components.
		for (const component of this.components.values()) {
			// Call the onUpdate method.
			component.onUpdate?.();
		}

		// Create a new BlockActorDataPacket.
		const update = new BlockActorDataPacket();
		update.position = this.position;
		update.nbt = this.nbt;
		// Send the packet to the dimension.
		this.dimension.broadcast(update);

		// Check if the surrounding blocks should be updated.
		if (surrounding) {
			this.above().update(false, source);
			this.below().update(false, source);
			this.north().update(false, source);
			this.south().update(false, source);
			this.east().update(false, source);
			this.west().update(false, source);
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
