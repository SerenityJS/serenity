import {
	BlockActorDataPacket,
	BlockCoordinates,
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
	BlockType,
	type BlockState
} from "@serenityjs/block";
import { ItemIdentifier, ItemType } from "@serenityjs/item";
import {
	CompoundTag,
	IntTag,
	type ListTag,
	type NBTTag,
	StringTag,
	Tag
} from "@serenityjs/nbt";

import { ItemStack } from "../item";
import {
	BlockCollisionComponent,
	BlockComponent,
	BlockStateComponent
} from "../components";
import {
	BlockUpdateSignal,
	PlayerBreakBlockSignal,
	PlayerInteractWithBlockSignal,
	PlayerPlaceBlockSignal
} from "../events";

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
	 * Checks if the block has an NBT tag.
	 * @param tag The tag to check.
	 * @returns Whether or not the block has the NBT tag.
	 */
	public hasNbtTag(tag: string): boolean {
		return this.nbt.hasTag(tag);
	}

	/**
	 * Gets the NBT tag of the block.
	 * @param tag The tag to get.
	 * @returns The NBT tag of the block if it exists.
	 */
	public getNbtTag(tag: string): NBTTag | undefined {
		return this.nbt.getTag(tag);
	}

	/**
	 * Add a CompoundTag to the block.
	 * @param tag The CompoundTag to add.
	 * @returns Whether or not the NBT tag was added.
	 */
	public addNbtTag(tag: NBTTag): boolean {
		// Check if the block has the same NBT tag.
		// If so, we will return false.
		if (this.nbt.hasTag(tag.name)) return false;

		// Add the NBT tag to the block.
		this.nbt.addTag(tag);

		// Update the block.
		this.update();

		// Return true as the NBT tag was added.
		return true;
	}

	/**
	 * Remove a NBT tag from the block.
	 * @param tag The tag to remove.
	 * @returns Whether or not the NBT tag was removed.
	 */
	public removeNbtTag(tag: string): boolean {
		// Check if the block has the NBT tag.
		// If not, we will return false.
		if (!this.nbt.hasTag(tag)) return false;

		// Remove the NBT tag from the block.
		this.nbt.removeTag(tag);

		// Update the block.
		this.update();

		// Return true as the NBT tag was removed.
		return true;
	}

	/**
	 * Sets the NBT tag of the block.
	 * @param tag The tag to set.
	 */
	public setNbtTag(tag: NBTTag): void {
		// Set the NBT tag to the block.
		this.nbt.setTag(tag.name, tag);

		// Update the block.
		this.update();
	}

	/**
	 * Sets the permutation of the block.
	 * @param permutation The permutation to set.
	 * @param options The options of the block update.
	 * @returns Whether or not the permutation was set.
	 */
	public setPermutation(
		permutation: BlockPermutation,
		options?: BlockUpdateOptions
	): boolean {
		// Store the old permutation of the block.
		const oldPermutation = this.permutation;

		// Query with the clearComponents option.
		const clear =
			options?.clearComponents === undefined ? true : options.clearComponents;

		// Clear the previous components.
		if (this.permutation.type !== permutation.type && clear)
			this.clearComponents();

		// Set the permutation of the block.
		this.permutation = permutation;

		// Get the x, y, and z coordinates of the block.
		const { x, y, z } = this.position;

		// Get the chunk the block is in.
		const chunk = this.dimension.getChunk(x >> 4, z >> 4);

		// Set the permutation of the block.
		chunk.setPermutation(x, y, z, this.permutation);

		// Create a new UpdateBlockPacket.
		const update = new UpdateBlockPacket();

		// Set the packet properties.
		update.networkBlockId = this.permutation.network;
		update.position = this.position;
		update.flags = UpdateBlockFlagsType.Network;
		update.layer = UpdateBlockLayerType.Normal;

		// Send the packet to the dimension.
		this.dimension.broadcast(update);

		// If the components should be cleared, we will register the new components.
		if (clear) {
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
		}

		// Check if the change was initiated by a player.
		// If so, we will play the block place sound.
		if (options && options.player) {
			// Get the clicked position of the player.
			const clickedFace = options.blockFace ?? BlockFace.Top;
			const clickedPosition = options.clickPosition ?? new Vector3f(0, 0, 0);

			// Create a new PlayerPlaceBlockSignal.
			const signal = new PlayerPlaceBlockSignal(
				this,
				options.player,
				this.permutation,
				clickedFace,
				clickedPosition
			);

			// Emit the signal to the dimension.
			const value = signal.emit();
			if (!value) {
				// If the signal was cancelled, we will revert the changes.
				this.setPermutation(oldPermutation, { clearComponents: false });

				// Return false as the signal was cancelled.
				return false;
			}

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

		// Return true if the permutation was set.
		return true;
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
		this.setPermutation(permutation, options);

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
	 * Retrieves the neighboring blocks surrounding the current block.
	 *
	 * @returns An array of `Block` objects representing the neighboring blocks.
	 * The array includes the blocks above, below, north, south, east, and west of the current block.
	 */
	public getNeighbors(): Array<Block> {
		return [
			this.above(),
			this.below(),
			this.north(),
			this.south(),
			this.east(),
			this.west()
		];
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
		return this.dimension.getBlock({
			...this.position,
			y: this.position.y + (steps ?? 1)
		});
	}

	/**
	 * Gets the block below this block.
	 *
	 * @param steps The amount of steps to go down.
	 */
	public below(steps?: number): Block {
		return this.dimension.getBlock({
			...this.position,
			y: this.position.y - (steps ?? 1)
		});
	}

	/**
	 * Gets the block to the north of this block.
	 *
	 * @param steps The amount of steps to go north.
	 */
	public north(steps?: number): Block {
		return this.dimension.getBlock({
			...this.position,
			z: this.position.z - (steps ?? 1)
		});
	}

	/**
	 * Gets the block to the south of this block.
	 *
	 * @param steps The amount of steps to go south.
	 */
	public south(steps?: number): Block {
		return this.dimension.getBlock({
			...this.position,
			z: this.position.z + (steps ?? 1)
		});
	}

	/**
	 * Gets the block to the east of this block.
	 *
	 * @param steps The amount of steps to go east.
	 */
	public east(steps?: number): Block {
		return this.dimension.getBlock({
			...this.position,
			x: this.position.x + (steps ?? 1)
		});
	}

	/**
	 * Gets the block to the west of this block.
	 *
	 * @param steps The amount of steps to go west.
	 */
	public west(steps?: number): Block {
		return this.dimension.getBlock({
			...this.position,
			x: this.position.x - (steps ?? 1)
		});
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
	 * @returns Whether or not the block was destroyed.
	 */
	public destroy(playerInitiated?: Player): boolean {
		// Check if the destruction was initiated by a player.
		if (playerInitiated) {
			// Get the inventory of the player.
			const inventory = playerInitiated.getComponent("minecraft:inventory");

			// Get the held item of the player.
			const itemStack = inventory.getHeldItem();

			// Create a new PlayerBreakBlockSignal.
			const signal = new PlayerBreakBlockSignal(
				this,
				playerInitiated,
				itemStack
			);

			// Emit the signal to the dimension.
			const value = signal.emit();
			if (!value) {
				// If the signal was cancelled, we will revert the changes
				this.setPermutation(this.permutation, { clearComponents: false });

				// Return false as the signal was cancelled.
				return false;
			}
		}

		// Call the onBreak method of the components.
		for (const component of this.components.values()) {
			// Call the onBlockBrokenByPlayer method.
			component.onBreak?.(playerInitiated);
		}

		// Get the air permutation.
		const air = BlockPermutation.resolve(BlockIdentifier.Air);

		// Set the block permutation to air.
		const placed = this.setPermutation(air);

		// Check if the block was not placed.
		if (!placed) return false;

		// Since the block is becoming air, we can remove the block from the dimension cache to save memory.
		this.dimension.blocks.delete(this.position);

		return true;
	}

	/**
	 * Updates the block and the surrounding blocks.
	 * @param surrounding If the surrounding blocks should be updated.
	 */
	public update(surrounding = false, source?: Block): void {
		// Create a new BlockUpdateSignal.
		const signal = new BlockUpdateSignal(this);
		const value = signal.emit();

		// Check if the signal was cancelled.
		if (!value) return;

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
			this.getNeighbors().map((neighbor) => neighbor?.update(false, source));
		}
	}

	/**
	 * Checks if the block has any collision
	 * @returns Wether or not the block has any existing collision
	 */
	public hasCollision(): boolean {
		if (!this.isAir()) return false;
		if (!this.hasComponent("minecraft:collision_box"))
			new BlockCollisionComponent(this);
		return this.getComponent("minecraft:collision_box").boxes.length > 0;
	}

	/**
	 * Causes a player to interact with the block.
	 * @param player The player interacting with the block.
	 * @param face The face of the block the player is interacting with.
	 * @param faceLocation The location of the face the player is interacting with.
	 * @returns Whether or not the player was able to interact with the block.
	 */
	public interact(
		player: Player,
		face: BlockFace,
		faceLocation: Vector3f
	): boolean {
		// Get the held item of the player.
		const inventory = player.getComponent("minecraft:inventory");
		const itemStack = inventory.getHeldItem();

		// Create a new PlayerInteractWithBlockSignal.
		const signal = new PlayerInteractWithBlockSignal(
			player,
			this,
			face,
			faceLocation,
			itemStack
		);

		// Emit the signal to the dimension.
		const value = signal.emit();
		if (!value)
			// Return false as the signal was cancelled.
			return false;

		// Call the onInteract method of the components.
		for (const component of this.components.values()) {
			// Call the onInteract method.
			component.onInteract?.(player);
		}

		// Return true as the player was able to interact with the block.
		return true;
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

	public static serialize(block: Block): CompoundTag {
		// Create the root compound tag.
		const root = new CompoundTag("", {
			id: new StringTag("id", block.getType().identifier),
			hash: new IntTag("hash", block.permutation.network),
			x: new IntTag("x", block.position.x),
			y: new IntTag("y", block.position.y),
			z: new IntTag("z", block.position.z)
		});

		// Create the components list tag.
		const components = root.createListTag("SerenityComponents", Tag.Compound);

		// Iterate over the components and serialize them.
		for (const component of block.getComponents()) {
			// Get the component type.
			const type = BlockComponent.components.get(component.identifier);
			if (!type) continue;

			// Create a data compound tag for the data to be written to.
			// And serialize the component.
			const data = new CompoundTag("data");
			type.serialize(data, component);

			// Create the component tag.
			const componentTag = new CompoundTag().addTag(
				new StringTag("identifier", component.identifier),
				data
			);

			// Add the component to the list.
			components.push(componentTag);
		}

		// Return the root compound tag.
		return root;
	}

	public static deserialize(dimension: Dimension, nbt: CompoundTag): Block {
		// Get the block type.
		const type = BlockType.get(nbt.getTag("id")?.value as keyof BlockState);

		// Get the block permutation.
		const permutation = type.permutations.find(
			(x) => x.network === (nbt.getTag("hash")?.value as number)
		);

		// Check if the permutation is valid.
		if (!permutation) throw new Error("Invalid block permutation.");

		// Get the block coordinates.
		const x = nbt.getTag("x")?.value as number;
		const y = nbt.getTag("y")?.value as number;
		const z = nbt.getTag("z")?.value as number;

		// Create a new block position.
		const position = new BlockCoordinates(x, y, z);

		// Create a new block.
		const block = new Block(dimension, permutation, position);

		// Get the components list tag.
		const components =
			nbt.getTag<ListTag<CompoundTag>>("SerenityComponents")?.value ?? [];

		// Iterate over the components and deserialize them.
		for (const componentTag of components) {
			// Get the component identifier.
			const identifier = componentTag.getTag("identifier")?.value as string;

			// Get the component type.
			const type = BlockComponent.components.get(identifier);
			if (!type) continue;

			// Deserialize the component.
			type.deserialize(componentTag.getTag("data") as CompoundTag, block);
		}

		// Return the block.
		return block;
	}
}

export { Block };
