import {
  BlockFace,
  BlockPosition,
  Gamemode,
  LevelEvent,
  LevelEventPacket,
  Vector3f
} from "@serenityjs/protocol";

import { Dimension, World } from "../world";
import {
  BlockDestroyOptions,
  BlockEntry,
  BlockInteractionOptions,
  BlockProperties,
  ItemStackProperties,
  JSONLikeObject,
  JSONLikeValue
} from "../types";
import { Chunk } from "../world/chunk";
import { ItemStack, ItemType } from "../item";
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
import { DefaultBlockEntry } from "../constants";

import { BlockDirectionTrait, BlockTrait } from "./traits";
import { NbtMap } from "./maps";

import { BlockPermutation, BlockType } from ".";

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
   * The dimension the block is in.
   */
  public readonly dimension: Dimension;

  /**
   * The position of the block. (x, y, z)
   */
  public readonly position: BlockPosition;

  /**
   * The dynamic properties that are attached to the block.
   * Dynamic properties is additional data that is attached to the block and will be saved with the world database.
   * These are usaully used by traits to store additional data, but can be used by other systems as well.
   */
  public readonly dyanamicProperties = new Map<string, JSONLikeValue>();

  /**
   * The traits that are attached to the block.
   * Traits add additional behavior to the block and only the trait identifier will be saved with the world database.
   * Traits generally use components or nbt to store additional data.
   */
  public readonly traits = new Map<string, BlockTrait>();

  /**
   * The nbt data that is attached to the block.
   * Nbt data is additional data that is attached to the block and will be saved with the world database.
   * The format of the nbt data is exactly the same as the nbt format of vanilla Minecraft.
   * This data is used to apply additional metadata to the block. (Custom Name, Chest Open/Closed, etc.)
   */
  public readonly nbt = new NbtMap(this);

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
    properties?: Partial<BlockProperties>
  ) {
    this.serenity = dimension.world.serenity;
    this.dimension = dimension;
    this.position = position;

    if (properties?.entry)
      this.loadDataEntry(this.dimension.world, properties.entry);
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

  public getState<T>(key: string): T {
    return this.permutation.state[key as keyof BlockPermutation["state"]] as T;
  }

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
   * @param entry The block entry to load the block data from.
   */
  public setPermutation(
    permutation: BlockPermutation,
    entry?: BlockEntry
  ): void {
    // Check if the type of the permutation has changed.
    if (this.permutation.type !== permutation.type) {
      // Clear the components and traits if the type has changed.
      this.traits.clear();
      this.dyanamicProperties.clear();
    }

    // Check if the block is air.
    if (permutation.type.air) {
      // Remove the block from the cache if it is air.
      this.dimension.blocks.delete(BlockPosition.hash(this.position));
    }

    // Set the permutation of the block.
    this.dimension.setPermutation(this.position, permutation);

    // Check if the entry is provided.
    if (entry) this.loadDataEntry(this.world, entry);

    // Get the traits from the block palette
    const traits = this.world.blockPalette.getRegistry(
      permutation.type.identifier
    );

    // Fetch any traits that apply to the base type components
    for (const identifier of permutation.type.components.entries.keys()) {
      // Get the trait from the block palette using the identifier
      const trait = this.world.blockPalette.getTrait(identifier);

      // Check if the trait exists
      if (trait) traits.push(trait);
    }

    // Fetch any traits that are block state specific
    for (const key of Object.keys(permutation.state)) {
      // Iterate over the trait in the registry.
      for (const trait of this.world.blockPalette.getAllTraits()) {
        // Check if the trait state key matches the block state key
        if (trait.state === key)
          // If so, add the trait to the block traits
          traits.push(trait);
      }
    }

    // Iterate over all the traits and apply them to the block
    for (const trait of traits) this.addTrait(trait);

    // Check if the block should be cached.
    if (
      (this.dyanamicProperties.size > 0 || this.traits.size > 0) &&
      !this.isAir
    ) {
      // Calculate the block hash using the position
      const hash = BlockPosition.hash(this.position);

      // Set the block in the cache.
      this.dimension.blocks.set(hash, this);
    }

    // Update the block after the permutation change
    this.update(true);
  }

  /**
   * Checks if the block type has the specified tag.
   * @param tag The tag to check for.
   * @returns Whether the block type has the tag.
   */
  public hasTag(tag: string): boolean {
    return this.type.tags.includes(tag);
  }

  /**
   * Whether the block has the specified dynamic property.
   * @param key The key of the dynamic property to check for.
   * @returns Whether the block has the dynamic property.
   */
  public hasDynamicProperty(key: string): boolean {
    return this.dyanamicProperties.has(key);
  }

  /**
   * Gets the specified dynamic property from the block.
   * @param key The key of the dynamic property to get from the block.
   * @returns The dynamic property if it exists, otherwise null.
   */
  public getDynamicProperty<T extends JSONLikeObject>(key: string): T | null {
    return this.dyanamicProperties.get(key) as T | null;
  }

  /**
   * Removes the specified dynamic from the block.
   * @param key The key of the dynamic to remove.
   */
  public removeDynamicProperty(key: string): void {
    this.dyanamicProperties.delete(key);
  }

  /**
   * Adds a dynamic property to the block.
   * @param key The key of the dynamic property to add.
   * @param property The dynamic property to add.
   */
  public addDynamicProperty(key: string, property: JSONLikeObject): void {
    this.dyanamicProperties.set(key, property);
  }

  /**
   * Sets the specified dynamic property to the block.
   * @param key The key of the dynamic property to set.
   * @param property The dynamic property to set.
   */
  public setDynamicProperty<T extends JSONLikeObject>(
    key: string,
    property: T
  ): void {
    this.dyanamicProperties.set(key, property);
  }

  /**
   * Whether the block has the specified trait.
   * @param trait The trait to check for
   * @returns Whether the block has the trait
   */
  public hasTrait(trait: string | typeof BlockTrait): boolean {
    return this.traits.has(
      typeof trait === "string" ? trait : trait.identifier
    );
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
    // Get the trait from the block
    const instance = this.traits.get(
      typeof trait === "string" ? trait : trait.identifier
    );

    // Call the onRemove method of the trait
    instance?.onRemove?.();

    // Remove the trait from the block
    this.traits.delete(typeof trait === "string" ? trait : trait.identifier);
  }

  /**
   * Adds a trait to the block.
   * @param trait The trait to add to the block.
   * @param options The additional options to pass to the trait.
   * @returns The trait instance that was added to the block.
   */
  public addTrait<T extends typeof BlockTrait>(
    trait: T | BlockTrait,
    options?: ConstructorParameters<T>[1]
  ): InstanceType<T> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier))
      return this.traits.get(trait.identifier) as InstanceType<T>;

    // Check if the trait is in the palette
    if (!this.world.blockPalette.getTrait(trait.identifier, trait.state))
      this.world.logger.warn(
        `Trait "§c${trait.identifier}§r" was added to block "§d${this.type.identifier}§r:§d${JSON.stringify(this.position)}§r" in dimension "§a${this.dimension.identifier}§r" but does not exist in the palette. This may result in a deserilization error.`
      );

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

      // Return the trait that was added
      return instance;
    } catch (reason) {
      // Log the error to the console
      this.serenity.logger.error(
        `Failed to add trait "${trait.identifier}" to block "${this.type.identifier}:${JSON.stringify(this.position)}" in dimension "${this.dimension.identifier}"`,
        reason
      );

      // Return null as the trait could not be added
      return null as InstanceType<T>;
    }
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
   * Gets the tool required to break the block.
   * @returns The tool required to break the block.
   */
  public isToolCompatible(_itemStack: ItemStack): boolean {
    // Get the block permutation properties
    const properties = this.permutation.components;

    // If the hardness is less than 0, no tool is compatible.
    if (properties.hardness < 0) return false;

    // Check if the tool type is none.
    if (this.getToolType() === BlockToolType.None) return true;

    return true;
  }

  /**
   * Get the time it takes to break the block.
   * @param itemStack The item stack used to break the block.
   * @returns The time it takes to break the block.
   */
  public getBreakTime(itemStack?: ItemStack | null): number {
    // Get the block permutation properties.
    const properties = this.permutation.components;

    // Get the hardness of the block.
    let hardness = properties.hardness;

    if (!itemStack && this.getToolType() === BlockToolType.None) {
      hardness *= 1.5;
    } else if (itemStack && this.isToolCompatible(itemStack)) {
      hardness *= 1.5;
    } else {
      hardness *= 5;
    }

    return Math.ceil(hardness * 20);
  }

  /**
   * Gets the item stack of the block.
   * @param properties The additional properties to apply to the item stack.
   * @returns The item stack of the block.
   */
  public getItemStack(properties?: Partial<ItemStackProperties>): ItemStack {
    // Get the itemPalette from the world.
    const palette = this.world.itemPalette;

    // Get the item type of the block.
    const type = palette.resolveType(this.type) as ItemType;

    // Create a new item stack with the type.
    const itemStack = new ItemStack(type, properties);

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
      const signal = new PlayerInteractWithBlockSignal(options.origin, this);

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
    if (options?.origin?.isPlayer() && options?.dropLoot) {
      // Check if the player is in survival mode.
      if (options.origin.gamemode === Gamemode.Survival) this.spawnLoot();
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
      const amount = drop.roll();

      // Check if the amount is less than or equal to 0.
      if (amount <= 0) continue;

      // Create a new ItemStack.
      const itemStack = new ItemStack(drop.type as ItemIdentifier, {
        amount,
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
   * Gets the block's data as a database entry.
   * @returns The block entry object.
   */
  public getDataEntry(): BlockEntry {
    // Get the position of the block.
    const { x, y, z } = this.position;

    // Create the block entry object.
    const entry: BlockEntry = {
      identifier: this.type.identifier,
      permutation: this.permutation.networkId,
      position: [x, y, z],
      traits: [...this.traits.keys()],
      dynamicProperties: [...this.dyanamicProperties.entries()],
      nbtProperties: this.nbt.serialize().toString("base64")
    };

    // Return the block entry object.
    return entry;
  }

  /**
   * Loads the block data from a block entry object.
   * @param world The world the block is in.
   * @param entry The block entry object to load the block data from.
   * @param overwrite Whether to overwrite the block data.
   */
  public loadDataEntry(
    world: World,
    entry: BlockEntry,
    overwrite = true
  ): void {
    // Spread the default block entry with the provided entry.
    // This will ensure that all the properties are set.
    entry = { ...DefaultBlockEntry, ...entry };

    // Check if the block should be overwritten.
    if (overwrite) {
      this.traits.clear();
      this.dyanamicProperties.clear();
    }

    // Add the dynamic properties to the block, if it does not already exist.
    for (const [key, value] of entry.dynamicProperties) {
      if (!this.dyanamicProperties.has(key))
        this.dyanamicProperties.set(key, value);
    }

    // Add the traits to the block, if it does not already exist
    for (const trait of entry.traits) {
      // Check if the palette has the trait
      const traitType = world.blockPalette.traits.get(trait);

      // Check if the trait exists in the palette
      if (!traitType) {
        world.logger.error(
          `Failed to load trait "${trait}" for block "${this.type.identifier}:${this.position.x},${this.position.y},${this.position.z}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the block
      this.addTrait(traitType);
    }

    // Deserialize the nbt properties of the block
    this.nbt.deserialize(Buffer.from(entry.nbtProperties, "base64"));
  }
}

export { Block };
