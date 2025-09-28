import {
  BlockActorDataPacket,
  BlockFace,
  BlockPosition,
  Enchantment,
  Gamemode,
  LevelEvent,
  LevelEventPacket,
  Vector3f
} from "@serenityjs/protocol";
import { BaseTag } from "@serenityjs/nbt";

import { Dimension, World } from "../world";
import {
  BlockDestroyOptions,
  BlockInteractionOptions,
  JSONLikeValue
} from "../types";
import { Chunk } from "../world/chunk";
import {
  ItemStackEnchantableTrait,
  ItemStack,
  ItemType,
  type ItemStackOptions
} from "../item";
import {
  BlockIdentifier,
  BlockToolType,
  CardinalDirection,
  ItemIdentifier
} from "../enums";
import { Serenity } from "../serenity";
import {
  PlayerBreakBlockSignal,
  PlayerInteractWithBlockSignal
} from "../events";

import { BlockDirectionTrait, BlockTrait } from "./traits";
import {
  BlockPermutation,
  BlockType,
  BlockTypeCollisionBoxComponent,
  BlockTypeGeometryComponent,
  BlockTypeSelectionBoxComponent
} from "./identity";
import { BlockLevelStorage } from "./storage";

/**
 * Block is a class the represents an instance of a block in a dimension of a world.
 * The Block instance contains its position, dimension, type, permutation, components, traits, and nbt data.
 * Blocks can be interacted with, destroyed, and have additional behavior added to them through traits.
 *
 * ```ts
  // Fetching a block from a dimension.
  const query = dimension.getBlock({ x: 0, y: 0, z: 0 });
 * ```
 */
class Block {
  /**
   * The serenity instance of the server.
   */
  protected readonly serenity: Serenity;

  /**
   * The traits that are attached to the block.
   * Traits add additional behavior to the block and only the trait identifier will be saved with the world database.
   * Traits generally use components or nbt to store additional data.
   */
  private readonly traits = new Map<string, BlockTrait>();

  /**
   * The dimension the block is in.
   */
  public readonly dimension: Dimension;

  /**
   * The position of the block. (x, y, z)
   */
  public readonly position: BlockPosition;

  /**
   * The block type of the block.
   * This property will contain any additional metadata that is global to the block type.
   */
  public get type(): BlockType {
    return this.permutation.type;
  }

  /**
   * The block type of the block.
   * This property will contain any additional metadata that is global to the block type.
   */
  public set type(type: BlockType) {
    this.setPermutation(type.getPermutation());
  }

  /**
   * The block identifier of the block. (minecraft:stone, minecraft:oak_log, minecraft:air, etc.)
   */
  public get identifier(): BlockIdentifier {
    return this.type.identifier;
  }

  /**
   * The block identifier of the block. (minecraft:stone, minecraft:oak_log, minecraft:air, etc.)
   */
  public set identifier(identifier: BlockIdentifier) {
    // Resolve the block type from the block palette.
    const type = this.world.blockPalette.resolveType(identifier);

    // Set the block type of the block.
    this.type = type;
  }

  /**
   * The current permutation of the block.
   * The permutation contains the specific state of the block, which determines the block's appearance and behavior.
   * The permutation is a combination of the block type and the block state.
   */
  public get permutation(): BlockPermutation {
    return this.dimension.getPermutation(this.position);
  }

  /**
   * The current permutation of the block.
   * The permutation contains the specific state of the block, which determines the block's appearance and behavior.
   * The permutation is a combination of the block type and the block state.
   */
  public set permutation(permutation: BlockPermutation) {
    this.setPermutation(permutation);
  }

  /**
   * Whether or not the block is air.
   * Usaully if the block is air, it is not cached in the dimension.
   */
  public get isAir(): boolean {
    return this.permutation.type.air;
  }

  /**
   * Whether or not the block is liquid.
   */
  public get isLiquid(): boolean {
    return this.permutation.type.liquid;
  }

  /**
   * Whether or not the block is solid.
   * Depening on the value, this will determine if entities can pass through the block.
   */
  public get isSolid(): boolean {
    return this.permutation.type.solid;
  }

  /**
   * Whether or not the block is loggable.
   * Depening on the value, this will determine if the block can be logged with a fluid type block.
   */
  public get isLoggable(): boolean {
    return this.type.loggable;
  }

  /**
   * Whether or not the block is waterlogged.
   */
  public get isWaterlogged(): boolean {
    // Check if the block can be waterlogged
    if (!this.isLoggable) return false;

    // Get the permutation of the block
    const permutation = this.dimension.getPermutation(this.position);

    // Check if the permutation is water
    return permutation.type.identifier === BlockIdentifier.Water;
  }

  /**
   * Whether or not the block is waterlogged.
   */
  public set isWaterlogged(value: boolean) {
    // Check if the block can be waterlogged
    if (!this.isLoggable) return;

    // Get the permutation of the block
    const permutation = value
      ? this.world.blockPalette.resolvePermutation(BlockIdentifier.Water)
      : this.world.blockPalette.resolvePermutation(BlockIdentifier.Air);

    // Set the block permutation
    this.dimension.setPermutation(this.position, permutation, 1);
  }

  /**
   * Whether or not the block is lava logged.
   */
  public get isLavaLogged(): boolean {
    // Check if the block can be waterlogged
    if (!this.isLoggable) return false;

    // Get the permutation of the block
    const permutation = this.dimension.getPermutation(this.position);

    // Check if the permutation is water
    return permutation.type.identifier === BlockIdentifier.Lava;
  }

  /**
   * Whether or not the block is lava logged.
   */
  public set isLavaLogged(value: boolean) {
    // Check if the block can be waterlogged
    if (!this.isLoggable) return;

    // Get the permutation of the block
    const permutation = value
      ? this.world.blockPalette.resolvePermutation(BlockIdentifier.Lava)
      : this.world.blockPalette.resolvePermutation(BlockIdentifier.Air);

    // Set the block permutation
    this.dimension.setPermutation(this.position, permutation, 1);
  }

  /**
   * Whether the block is currently ticking or not.
   * If true, this means the behaviors of the block are being processed.
   * If false, this means the block currently isn't within the simulation distance from a player.
   */
  public isTicking = false;

  /**
   * The direction the block is facing.
   */
  public get direction(): CardinalDirection {
    // Check if the block has the direction trait
    if (!this.hasTrait(BlockDirectionTrait)) return CardinalDirection.North;

    // Get the direction trait
    const trait = this.getTrait(BlockDirectionTrait);

    // Get the direction of the block
    return trait.getDirection();
  }

  /**
   * The direction the block is facing.
   */
  public set direction(direction: CardinalDirection) {
    // Check if the block has the direction trait
    if (!this.hasTrait(BlockDirectionTrait)) return;

    // Get the direction trait
    const trait = this.getTrait(BlockDirectionTrait);

    // Set the direction of the block
    trait.setDirection(direction);
  }

  public constructor(
    dimension: Dimension,
    position: BlockPosition,
    storage?: BlockLevelStorage
  ) {
    // Assign the properties to the block
    this.serenity = dimension.world.serenity;
    this.dimension = dimension;
    this.position = position;

    // Get the chunk the block is in
    const chunk = this.getChunk();

    // If a storage is provided, set it in the chunk
    if (storage) chunk.setBlockStorage(position, storage, false);

    // Iterate over the traits of the block's storage and add them to the block
    for (const identifier of this.getStorage().getTraits()) {
      // Check if the trait exists in the block palette.
      const traitType = this.world.blockPalette.getTrait(identifier);

      // Get the position of the block.
      const { x, y, z } = this.position;

      // If the trait does not exist, log an error and skip it.
      if (!traitType) {
        // Log a warning to the console.
        this.world.logger.warn(
          `Skipping BlockTrait for block §u${this.identifier}§r @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r, as the trait §u${identifier}§r does not exist in the block palette.`
        );

        // Skip the trait if it does not exist.
        continue;
      }

      // Add the trait to the block.
      const trait = this.addTrait(traitType);

      // Log the loading of the trait.
      this.world.logger.debug(
        `Loaded BlockTrait §u${trait.identifier}§r for block §u${this.identifier}§r @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r.`
      );
    }

    // Add the traits of the block type to the block
    for (const [, trait] of this.type.traits) this.addTrait(trait);
  }

  /**
   * Gets the current world the block is in.
   */
  public get world(): World {
    return this.dimension.world;
  }

  /**
   * Updates the block and surrounding blocks.
   * @param surrounding Whether to update the surrounding blocks.
   * @param source The source of the update.
   */
  public update(surrounding = false, source: Block = this): void {
    // Call the onUpdate method of the block
    for (const trait of this.traits.values()) {
      // Attempt to call the onUpdate method of the trait
      try {
        // Call the onUpdate method of the trait
        trait.onUpdate?.(source);
      } catch (reason) {
        // Log the error to the console
        this.serenity.logger.error(
          `Failed to update trait "${trait.identifier}" for block "${this.type.identifier}:${this.position}" in dimension "${this.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the block
        this.traits.delete(trait.identifier);
      }
    }

    // Check if the block is surrounded
    if (surrounding)
      // If so, update the surrounding blocks
      this.getNeighborBlocks().forEach((block) => block.update(false, source));
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
   * Check if the block has a specific state.
   * @param key The key of the state to check for.
   * @returns Whether the block has the state or not.
   */
  public hasState(key: string): boolean {
    // Check if the permutation has the state key
    return Object.prototype.hasOwnProperty.call(this.permutation.state, key);
  }

  /**
   * Get the a specific state of the block.
   * @param key The key of the state to get.
   * @returns The value of the state.
   */
  public getState<T>(key: string): T {
    return this.permutation.state[key as keyof BlockPermutation["state"]] as T;
  }

  /**
   * Sets the state of the block.
   * @param key The key of the state to set.
   * @param value The value of the state to set.
   */
  public setState<T>(key: string, value: T): void {
    // Get the current state of the block
    const current = this.permutation.state;

    // Set the new state of the block
    const state = { ...current, [key]: value };

    // Get the permutation of the block
    const permutation = this.type.getPermutation(state);

    // Set the permutation of the block
    this.setPermutation(permutation);
  }

  /**
   * Gets the current permutation of the block.
   * @returns
   */
  public getPermutation(): BlockPermutation {
    return this.permutation;
  }

  /**
   * Sets the permutation of the block.
   * @param permutation The permutation to set the block to.
   * @param storage The level storage to load into the block.
   */
  public setPermutation(
    permutation: BlockPermutation,
    storage?: BlockLevelStorage
  ): void {
    // Check if the type of the permutation has changed.
    if (this.permutation.type !== permutation.type) {
      // Clear the nbt, traits, and dynamic properties of the block.
      this.getStorage().clear();
      this.traits.clear();
    }

    // Check if the block is air.
    if (permutation.type.air) {
      // Remove the block from the cache if it is air.
      this.dimension.blocks.delete(BlockPosition.hash(this.position));
    }

    // Set the permutation of the block.
    this.dimension.setPermutation(this.position, permutation);

    // Check if a level storage is provided.
    if (storage) {
      // Get the chunk the block is in.
      const chunk = this.getChunk();

      // Set the block storage in the chunk.
      chunk.setBlockStorage(this.position, storage, false);

      // Iterate over the traits of the block's storage and add them to the block
      for (const identifier of this.getStorage().getTraits()) {
        // Check if the trait exists in the block palette.
        const traitType = this.world.blockPalette.getTrait(identifier);

        // Get the position of the block.
        const { x, y, z } = this.position;

        // If the trait does not exist, log an error and skip it.
        if (!traitType) {
          // Log a warning to the console.
          this.world.logger.warn(
            `Skipping BlockTrait for block §u${this.identifier}§r @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r, as the trait §u${identifier}§r does not exist in the block palette.`
          );

          // Skip the trait if it does not exist.
          continue;
        }

        // Add the trait to the block.
        const trait = this.addTrait(traitType);

        // Log the loading of the trait.
        this.world.logger.debug(
          `Loaded BlockTrait §u${trait.identifier}§r for block §u${this.identifier}§r @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r.`
        );
      }
    }

    // Push the nbt data of the permutation to the block's nbt.
    this.getStorage().push(...permutation.nbt.values());

    // Iterate over all the traits and apply them to the block
    for (const [, trait] of permutation.type.traits) this.addTrait(trait);

    // Check if the block should be cached.
    if ((this.getStorage().size > 0 || this.traits.size > 0) && !this.isAir) {
      // Calculate the block hash using the position
      const hash = BlockPosition.hash(this.position);

      // Set the block in the cache.
      this.dimension.blocks.set(hash, this);
    }

    // Update the block after the permutation change
    this.update(true);
  }

  /**
   * Whether the block has the specified dynamic property.
   * @param key The key of the dynamic property to check for.
   * @returns Whether the block has the dynamic property.
   */
  public hasDynamicProperty(key: string): boolean {
    return this.getStorage().hasDynamicProperty(key);
  }

  /**
   * Gets the specified dynamic property from the block.
   * @param key The key of the dynamic property to get from the block.
   * @returns The dynamic property if it exists, otherwise null.
   */
  public getDynamicProperty<T extends JSONLikeValue>(key: string): T | null {
    return this.getStorage().getDynamicProperty<T>(key);
  }

  /**
   * Removes the specified dynamic from the block.
   * @param key The key of the dynamic to remove.
   */
  public removeDynamicProperty(key: string): void {
    this.getStorage().removeDynamicProperty(key);
  }

  /**
   * Adds a dynamic property to the block.
   * @param key The key of the dynamic property to add.
   * @param property The dynamic property to add.
   */
  public addDynamicProperty(key: string, property: JSONLikeValue): void {
    this.getStorage().addDynamicProperty(key, property);
  }

  /**
   * Sets the specified dynamic property to the block.
   * @param key The key of the dynamic property to set.
   * @param property The dynamic property to set.
   */
  public setDynamicProperty<T extends JSONLikeValue>(
    key: string,
    property: T
  ): void {
    this.getStorage().setDynamicProperty(key, property);
  }

  /**
   * Get all dynamic properties of the block.
   * @returns A map of all dynamic properties of the block.
   */
  public getAllDynamicProperties(): Array<[string, JSONLikeValue]> {
    return this.getStorage().getDynamicProperties();
  }

  /**
   * Whether the block has the specified trait.
   * @param trait The trait to check for
   * @returns Whether the block has the trait
   */
  public hasTrait(trait: string | typeof BlockTrait): boolean {
    // Get the identifier of the trait
    const identifier = typeof trait === "string" ? trait : trait.identifier;

    // Return whether the block has the trait
    return this.traits.has(identifier);
  }

  /**
   * Gets the specified trait from the block.
   * @param trait The trait to get from the block
   * @returns The trait if it exists, otherwise null
   */
  public getTrait<T extends typeof BlockTrait>(trait: T): InstanceType<T>;

  /**
   * Gets the specified trait from the block.
   * @param trait The trait to get from the block
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string): BlockTrait | null;

  /**
   * Gets the specified trait from the block.
   * @param trait The trait to get from the block
   * @returns The trait if it exists, otherwise null
   */
  public getTrait(trait: string | typeof BlockTrait): BlockTrait | null {
    return this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    ) as BlockTrait | null;
  }

  /**
   * Removes the specified trait from the block.
   * @param trait The trait to remove
   */
  public removeTrait(trait: string | typeof BlockTrait): void {
    // Determine the identifier of the trait
    let identifier = typeof trait === "string" ? trait : trait.identifier;

    // Get the trait from the block
    const instance = this.traits.get(identifier);

    // Call the onRemove method of the trait
    instance?.onRemove?.();

    // Remove the trait from the block
    this.traits.delete(identifier);

    // If the trait has a state, append it to the identifier
    if (instance?.state) identifier += "@" + instance.state;

    // Remove the trait from the block's storage
    this.getStorage().removeTrait(identifier);
  }

  /**
   * Adds a trait to the block.
   * @param trait The trait to add to the block.
   * @param options The additional options to pass to the trait.
   * @returns The trait instance that was added to the block.
   */
  public addTrait<T extends typeof BlockTrait>(
    trait: T,
    options?: ConstructorParameters<T>[1]
  ): InstanceType<T> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier))
      // Return the existing trait instance
      return this.traits.get(trait.identifier) as InstanceType<T>;

    // Attempt to add the trait to the block
    try {
      // Check if the trait is a block trait
      if (trait instanceof BlockTrait) {
        // Add the trait to the block
        this.traits.set(trait.identifier, trait);

        // Call the onAdd method of the trait
        trait.onAdd?.();

        // Return the trait that was added
        return trait as InstanceType<T>;
      }

      // Create a new instance of the trait
      const instance = new trait(this, options) as InstanceType<T>;

      // Add the trait to the block
      this.traits.set(instance.identifier, instance);

      // Call the onAdd method of the trait
      instance.onAdd?.();

      // If the trait has a state, append it to the identifier
      const identifier = instance.state
        ? instance.identifier + "@" + instance.state
        : instance.identifier;

      // Add the trait to the block's storage
      this.getStorage().addTrait(identifier);

      // Return the trait that was added
      return instance;
    } catch (reason) {
      // Get the position of the block
      const { x, y, z } = this.position;

      // Log the error to the console
      this.serenity.logger.error(
        `Failed to add trait "${trait.identifier}" to block "${this.type.identifier} @ <${x}, ${y}, ${z}>" in dimension "${this.dimension.identifier}"`,
        reason
      );

      // Return null as the trait could not be added
      return null as InstanceType<T>;
    }
  }

  /**
   * Get all traits currently applied to the block.
   * @returns An array of all traits currently applied to the block.
   */
  public getAllTraits(): Array<BlockTrait> {
    return [...this.traits.values()];
  }

  /**
   * Get the nbt level storage for the block.
   * @returns The current level storage of the block.
   */
  public getStorage(): BlockLevelStorage {
    // Get the chunk the block is in
    const chunk = this.getChunk();

    // Prepare a variable to hold the block storage
    let storage: BlockLevelStorage;

    // Check if the chunk has a block storage for the block position
    if (chunk.hasBlockStorage(this.position)) {
      // Get the block storage from the chunk
      storage = chunk.getBlockStorage(this.position) as BlockLevelStorage;
    } else {
      // Create a new block storage for the block
      storage = new BlockLevelStorage(chunk);

      // Set the position of the block storage
      storage.setPosition(this.position);

      // Set the new block storage in the chunk's block storage map
      chunk.setBlockStorage(this.position, storage, false);
    }

    // Return the new block storage
    return storage;
  }

  /**
   * Check if the level storage has a specific tag entry.
   * @param name The name of the tag entry to check for.
   * @returns Whether the tag entry exists or not.
   */
  public hasStorageEntry(name: string): boolean {
    return this.getStorage().has(name);
  }

  /**
   * Get a specific tag entry from the level storage.
   * @param name The name of the tag entry to get.
   * @returns The tag entry if it exists, otherwise null.
   */
  public getStorageEntry<T extends BaseTag>(name: string): T | null {
    return this.getStorage().get<T>(name) ?? null;
  }

  /**
   * Set a specific tag entry in the level storage.
   * @param name The name of the tag entry to set.
   * @param tag The tag entry to set.
   */
  public setStorageEntry<T extends BaseTag>(name: string, tag: T): void {
    // Set the tag in the storage
    this.getStorage().set(name, tag);

    // Send a storage update packet to all players in the dimension
    this.sendStorageUpdate();
  }

  /**
   * Adds a tag entry to the level storage.
   * @param tag The tag entry to add.
   * @returns The tag entry that was added.
   */
  public addStorageEntry<T extends BaseTag>(tag: T): T {
    // Validate that the tag has a name
    if (!tag.name) throw new Error("Tag must have a name");

    // Send a storage update packet to all players in the dimension
    this.sendStorageUpdate();

    // Add the tag to the storage
    return this.getStorage().add(tag);
  }

  /**
   * Pushes multiple tag entries to the level storage.
   * @param tags The tag entries to push.
   */
  public pushStorageEntry(...tags: Array<BaseTag>): void {
    // Validate that all tags have a name
    for (const tag of tags) {
      if (!tag.name) throw new Error("All tags must have a name");
    }

    // Send a storage update packet to all players in the dimension
    this.sendStorageUpdate();

    // Push the tags to the storage
    this.getStorage().push(...tags);
  }

  /**
   * Deletes a tag entry from the level storage.
   * @param name The name of the tag entry to delete.
   * @returns Whether the tag entry was deleted or not.
   */
  public deleteStorageEntry(name: string): boolean {
    // Send a storage update packet to all players in the dimension
    this.sendStorageUpdate();

    // Delete the tag from the storage
    return this.getStorage().delete(name);
  }

  /**
   * Sends the current level storage to all players in the dimension.
   */
  public sendStorageUpdate(dirty = true): void {
    // Check if the storage is empty
    if (this.getStorage().size === 0) return;

    // Create a new BlockActorDataPacket
    const packet = new BlockActorDataPacket();
    packet.position = this.position;
    packet.nbt = this.getStorage();

    // Mark the storage as dirty if specified
    if (dirty) this.getChunk().dirty = true;

    // Send the packet to all players in the dimension
    this.dimension.broadcast(packet);
  }

  /**
   * Gets the tool type required to break the block.
   * @returns
   */
  public getToolType(): BlockToolType {
    // TODO: Implement tool type checking.

    return BlockToolType.None;
  }

  /**
   * Gets the item stack of the block.
   * @param options The options for the item stack.
   * @returns The item stack of the block.
   */
  public getItemStack(options?: Partial<ItemStackOptions>): ItemStack {
    // Get the itemPalette from the world.
    const palette = this.world.itemPalette;

    // Get the item type of the block.
    const type = palette.resolveType(this.type) as ItemType;

    // Create a new item stack with the type.
    const itemStack = new ItemStack(type, options);

    // Return the item stack.
    return itemStack;
  }

  /**
   * Gets all the neighbor blocks around the block.
   * @returns The neighbor blocks around the block.
   */
  public getNeighborBlocks(): Array<Block> {
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
   * Interact with the block, calling the onInteract method of the block traits.
   */
  public interact(
    options?: Partial<BlockInteractionOptions>
  ): BlockInteractionOptions {
    // Set the default options for the block interaction
    options = { cancel: false, ...options } as BlockInteractionOptions;

    // Check if the block was interacted with by a player
    if (options.origin) {
      // Create a new PlayerInteractWithBlockSignal
      const signal = new PlayerInteractWithBlockSignal(
        options.origin,
        this,
        options.placingBlock
      );

      // Emit the signal to the server
      options.cancel = !signal.emit();
    }

    // Call the block onInteract trait methods
    for (const trait of this.traits.values()) {
      // Call the onInteract method of the trait
      const success = trait.onInteract?.(options as BlockInteractionOptions);

      // If the result is undefined, continue
      // As the trait does not implement the method
      if (success === undefined) continue;

      // If the result is false, cancel the break
      options.cancel = !success;
    }

    // Return early if the interaction was canceled
    if (options.cancel) return { ...options, cancel: true };

    // Update the block after the interaction
    this.update(false);

    // Return the options with cancel set to false
    return { ...options, cancel: false };
  }

  /**
   * Destroys the block, dropping its loot if specified.
   * @param options The options for destroying the block.
   * @returns Whether the block was destroyed successfully; otherwise, false.
   */
  public destroy(options?: Partial<BlockDestroyOptions>): boolean {
    // Set the default options for the block break
    options = { cancel: false, ...options } as BlockDestroyOptions;

    // Check if the block was destroyed by a player
    if (options?.origin && options.origin.isPlayer()) {
      // Create a new PlayerBreakBlockSignal
      const signal = new PlayerBreakBlockSignal(this, options.origin);

      // Emit the signal to the server
      options.cancel = !signal.emit();

      // Set the drop loot value to the signal value
      options.dropLoot = signal.dropLoot;
    }

    // Call the block onBreak trait methods
    for (const trait of this.traits.values()) {
      // Check if the start break was successful
      const success = trait.onBreak?.(options as BlockDestroyOptions);

      // If the result is undefined, continue
      // As the trait does not implement the method
      if (success === undefined) continue;

      // If the result is false, cancel the break
      options.cancel = !success;
    }

    // Return false if the block break was canceled
    if (options.cancel) return false;

    // Check if the origin is a player.
    if (this.world.gamerules.doTileDrops === true)
      if (options?.origin?.isPlayer() && options?.dropLoot) {
        // Check if the player is in survival mode.
        if (options.origin.getGamemode() === Gamemode.Survival)
          this.spawnLoot();
      } // If the origin is not a player, drop the loot if specified.
      else if (options?.dropLoot) this.spawnLoot();

    // Create a new LevelEventPacket to broadcast the block break.
    const packet = new LevelEventPacket();
    packet.event = LevelEvent.ParticlesDestroyBlock;
    packet.position = BlockPosition.toVector3f(this.position);
    packet.data = this.permutation.networkId;

    // Broadcast the packet to the dimension.
    this.dimension.broadcast(packet);

    // Check if the block is waterlogged or lavalogged.
    if (this.isWaterlogged) this.isWaterlogged = false;
    if (this.isLavaLogged) this.isLavaLogged = false;

    // Get the air block permutation.
    const air = this.world.blockPalette.resolvePermutation(BlockIdentifier.Air);

    // Set the block permutation to air.
    this.setPermutation(air);

    // Return true if the block was destroyed.
    return true;
  }

  /**
   * Spawns the loot that is associated with the block.
   */
  public spawnLoot(): void {
    // Get the position of the block.
    const { x, y, z } = this.position;

    // Iterate over the drops of the block.
    for (const drop of this.type.drops) {
      // Check if the drop is air, if so we will skip it.
      if (drop.type === BlockIdentifier.Air) continue;

      // Roll the drop amount.
      const stackSize = drop.roll();

      // Check if the stackSize is less than or equal to 0.
      if (stackSize <= 0) continue;

      // Create a new ItemStack.
      const itemStack = new ItemStack(drop.type as ItemIdentifier, {
        stackSize,
        world: this.dimension.world
      });

      // Create a new ItemEntity.
      const itemEntity = this.dimension.spawnItem(
        itemStack,
        new Vector3f(x + 0.5, y + 0.5, z + 0.5)
      );

      // Add random x & z velocity to the item entity.
      const velocity = new Vector3f(
        Math.random() * 0.1 - 0.05,
        itemEntity.velocity.y,
        Math.random() * 0.1 - 0.05
      );

      // Add the velocity to the item entity.
      itemEntity.addMotion(velocity);
    }
  }

  /**
   * Get the time it takes to break the block.
   * @param itemStack The item stack used to break the block.
   * @returns The time it takes to break the block.
   */
  public getBreakTime(itemStack?: ItemStack | null): number {
    // Determine the base hardness & efficiency of the block.
    let hardness = this.getHardness();
    let efficiency = 1;

    // Check if the item stack is provided and has the digger component.
    if (itemStack && itemStack.components.hasDigger()) {
      // Get the digger component from the item stack.
      const digger = itemStack.components.getDigger();

      // Iterate over the digger speeds.
      for (const { speed, type, tags } of digger.getDestructionSpeeds()) {
        // Check if the block type matches the digger type.
        if (type === this.type) {
          // Apply the digger speed to the efficiency.
          efficiency *= speed;

          // Break out of the loop if the block type matches.
          break;
        }

        // Check if the block has any of the digger tags.
        for (const tag of tags ?? []) {
          // Check if the block type has the digger tag.
          if (this.type.hasTag(tag)) {
            // Apply the digger speed to the efficiency.
            efficiency *= speed;

            // Break out of the loop if the block type matches.
            break;
          }
        }
      }
    }

    // Check if there is no item stack and the block has requirements.
    if (!itemStack && !this.type.hasRequirements()) hardness *= 1.5;
    // Check if an item stack is provided and the block has requirements.
    else if (itemStack) {
      // Check if the block can be broken with a pickaxe, and if the item stack is a pickaxe.
      if (this.type.destructibleWithPickaxe() && itemStack.type.isPickaxe()) {
        // Apply the pickaxe efficiency.
        efficiency *= 1.5 * itemStack.type.getToolTier();

        // Check if the item stack has the enchantable trait.
        if (itemStack.hasTrait(ItemStackEnchantableTrait)) {
          // Get the enchantable trait from the item stack.
          const enchantable = itemStack.getTrait(ItemStackEnchantableTrait);

          // Add the efficiency enchantment to the efficiency multiplier.
          efficiency *= enchantable.getEnchantment(Enchantment.Efficiency) ?? 1;
        }
      }

      // Check if the block can be broken with an axe, and if the item stack is an axe.
      if (this.type.destructibleWithAxe() && itemStack.type.isAxe()) {
        // Apply the axe efficiency.
        efficiency *= 1.5 * itemStack.type.getToolTier();

        // Check if the item stack has the enchantable trait.
        if (itemStack.hasTrait(ItemStackEnchantableTrait)) {
          // Get the enchantable trait from the item stack.
          const enchantable = itemStack.getTrait(ItemStackEnchantableTrait);

          // Add the efficiency enchantment to the efficiency multiplier.
          efficiency *= enchantable.getEnchantment(Enchantment.Efficiency) ?? 1;
        }
      }

      // Check if the block can be broken with a shovel, and if the item stack is a shovel.
      if (this.type.destructibleWithShovel() && itemStack.type.isShovel()) {
        // Apply the shovel efficiency.
        efficiency *= 1.5 * itemStack.type.getToolTier();

        // Check if the item stack has the enchantable trait.
        if (itemStack.hasTrait(ItemStackEnchantableTrait)) {
          // Get the enchantable trait from the item stack.
          const enchantable = itemStack.getTrait(ItemStackEnchantableTrait);

          // Add the efficiency enchantment to the efficiency multiplier.
          efficiency *= enchantable.getEnchantment(Enchantment.Efficiency) ?? 1;
        }
      }

      // Check if the block can be broken with a hoe, and if the item stack is a hoe.
      if (this.type.destructibleWithHoe() && itemStack.type.isHoe()) {
        // Apply the hoe efficiency.
        efficiency *= 1.5 * itemStack.type.getToolTier();

        // Check if the item stack has the enchantable trait.
        if (itemStack.hasTrait(ItemStackEnchantableTrait)) {
          // Get the enchantable trait from the item stack.
          const enchantable = itemStack.getTrait(ItemStackEnchantableTrait);

          // Add the efficiency enchantment to the efficiency multiplier.
          efficiency *= enchantable.getEnchantment(Enchantment.Efficiency) ?? 1;
        }
      }

      // Check if the block can be broken with a sword, and if the item stack is a sword.
      if (this.type.destructibleWithSword() && itemStack.type.isSword()) {
        // Apply the sword efficiency.
        efficiency *= 1.5 * itemStack.type.getToolTier();

        // Check if the item stack has the enchantable trait.
        if (itemStack.hasTrait(ItemStackEnchantableTrait)) {
          // Get the enchantable trait from the item stack.
          const enchantable = itemStack.getTrait(ItemStackEnchantableTrait);

          // Add the efficiency enchantment to the efficiency multiplier.
          efficiency *= enchantable.getEnchantment(Enchantment.Efficiency) ?? 1;
        }
      }

      // Check if no efficiency was applied, and if the block has requirements.
      if (efficiency === 1) {
        // Apply incompatible efficiency.
        if (this.type.hasRequirements()) hardness *= 5;
        // Apply compatible efficiency.
        else hardness *= 1.5;
      }
    }
    // Apply defualt hardness.
    else hardness *= 5;

    // Return the calculated break time.
    return Math.ceil((hardness /= efficiency) * 20);
  }

  /**
   * Get the hardness of the block.
   * @returns The hardness level of the block.
   */
  public getHardness(): number {
    // Check if the permutation has hardness level.
    if (this.permutation.components.hasHardness())
      return this.permutation.components.getHardness();

    // Check if the type has hardness level.
    if (this.type.components.hasHardness())
      return this.type.components.getHardness();

    // If not, return 0.
    return 0;
  }

  /**
   * Get the amount of light emitted by the block.
   * @returns The amount of light emitted by the block.
   */
  public getLightEmission(): number {
    // Check if the permutation has light emission level.
    if (this.permutation.components.hasLightEmission())
      return this.permutation.components.getLightEmission();

    // Check if the type has light emission level.
    if (this.type.components.hasLightEmission())
      return this.type.components.getLightEmission();

    // If not, return 0.
    return 0;
  }

  /**
   * Get the amount of friction of the block.
   * @returns The amount of friction of the block.
   */
  public getFriction(): number {
    // Check if the permutation has friction level.
    if (this.permutation.components.hasFriction())
      return this.permutation.components.getFriction();

    // Check if the type has friction level.
    if (this.type.components.hasFriction())
      return this.type.components.getFriction();

    // If not, return 0.
    return 0;
  }

  /**
   * Get the collision box of the block.
   * @returns The collision box of the block.
   */
  public getCollisionBox(): BlockTypeCollisionBoxComponent | null {
    // Check if the permutation has collision box.
    if (this.permutation.components.hasCollisionBox())
      return this.permutation.components.getCollisionBox();

    // Check if the type has collision box.
    if (this.type.components.hasCollisionBox())
      return this.type.components.getCollisionBox();

    // If not, return null.
    return null;
  }

  /**
   * Get the selection box of the block.
   * @returns The selection box of the block.
   */
  public getSelectionBox(): BlockTypeSelectionBoxComponent | null {
    // Check if the permutation has selection box.
    if (this.permutation.components.hasSelectionBox())
      return this.permutation.components.getSelectionBox();

    // Check if the type has selection box.
    if (this.type.components.hasSelectionBox())
      return this.type.components.getSelectionBox();

    // If not, return null.
    return null;
  }

  /**
   * Get the geometry of the block.
   * @returns The geometry of the block.
   */
  public getGeometry(): BlockTypeGeometryComponent | null {
    // Check if the permutation has geometry component.
    if (this.permutation.components.hasGeometry())
      return this.permutation.components.getGeometry();

    // Check if the type has geometry component.
    if (this.type.components.hasGeometry())
      return this.type.components.getGeometry();

    // If not, return null.
    return null;
  }
}

export { Block };
