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
  BlockEntry,
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
import { Player } from "../entity";
import { PlayerInteractWithBlockSignal } from "../events";

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
   * The components that are attached to the block.
   * Components are additional data that is attached to the block and will be saved with the world database.
   * These are usaully used by traits to store additional data, but can be used by other systems as well.
   */
  public readonly components = new Map<string, JSONLikeValue>();

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
      this.components.clear();
    }

    // Check if the block is air.
    if (permutation.type.air) {
      // Remove the block from the cache if it is air.
      this.dimension.blocks.delete(BlockPosition.hash(this.position));
    }

    // Set the permutation of the block.
    this.dimension.setPermutation(this.position, permutation);
    // this.permutation = permutation;

    // Check if the entry is provided.
    if (entry) this.loadDataEntry(this.world, entry);

    // Get the traits from the block palette
    const traits = this.world.blockPalette.getRegistry(
      permutation.type.identifier
    );

    // Fetch any traits that apply to the base type components
    for (const identifier of permutation.type.components) {
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
    for (const trait of traits) {
      this.addTrait(trait);
    }

    // Check if the block should be cached.
    if ((this.components.size > 0 || this.traits.size > 0) && !this.isAir) {
      // Calculate the block hash using the position
      const hash = BlockPosition.hash(this.position);

      // Set the block in the cache.
      this.dimension.blocks.set(hash, this);
    }

    // Update the block after the permutation change
    this.update(true);
  }

  /**
   * Whether the block has the specified component.
   * @param key The key of the component to check for.
   * @returns Whether the block has the component.
   */
  public hasComponent(key: string): boolean {
    return this.components.has(key);
  }

  /**
   * Gets the specified component from the block.
   * @param key The key of the component to get from the block.
   * @returns The component if it exists, otherwise null.
   */
  public getComponent<T extends JSONLikeObject>(key: string): T | null {
    return this.components.get(key) as T | null;
  }

  /**
   * Removes the specified component from the block.
   * @param key The key of the component to remove.
   */
  public removeComponent(key: string): void {
    this.components.delete(key);
  }

  /**
   * Adds a component to the block.
   * @param key The key of the component to add.
   * @param component The component to add.
   */
  public addComponent(key: string, component: JSONLikeObject): void {
    this.components.set(key, component);
  }

  /**
   * Sets the specified component to the block.
   * @param key The key of the component to set.
   * @param component The component to set.
   */
  public setComponent<T extends JSONLikeObject>(
    key: string,
    component: T
  ): void {
    this.components.set(key, component);
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
   * @param trait The trait to add
   * @returns The trait that was added
   */
  public addTrait<T extends typeof BlockTrait>(
    trait: T | BlockTrait
  ): InstanceType<T> {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier))
      return this.traits.get(trait.identifier) as InstanceType<T>;

    // Check if the trait is in the palette
    if (!this.world.blockPalette.traits.has(trait.identifier))
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
      const instance = new trait(this) as InstanceType<T>;

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
    const properties = this.permutation.properties;

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
    const properties = this.permutation.properties;

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
   * Forces a player to interact with the block.
   * @param player The player to interact with the block.
   */
  public interact(player: Player): boolean {
    const signal = new PlayerInteractWithBlockSignal(
      player,
      this,
      player.getHeldItem(),
      null
    );

    if (!signal.emit()) return false;

    // Call the block onInteract trait methods
    for (const trait of this.traits.values()) {
      // Call the onInteract method of the trait
      const result = trait.onInteract?.(player);

      // Return false if the result is false
      if (result === false) return false;
    }

    // Update the block after the interaction
    this.update(false);

    // Return true if the block was interacted with
    return true;
  }

  /**
   * Destroys the block.
   * @param player Whether the block was destroyed by a player.
   * @returns Whether the block was destroyed successfully; otherwise, false.
   */
  public destroy(player?: Player): boolean {
    // Call the block onBreak trait methods
    let canceled = false;
    for (const trait of this.traits.values()) {
      // Check if the start break was successful
      const success = trait.onBreak?.(player);

      // If the result is undefined, continue
      // As the trait does not implement the method
      if (success === undefined) continue;

      // If the result is false, cancel the break
      canceled = !success;
    }

    // Return false if the block break was canceled
    if (canceled) return false;

    // Check if the player destroyed the block.
    if (player) {
      // Check if the player is in survival mode.
      // If so, the block should drop an item.
      if (player.gamemode === Gamemode.Survival) {
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

      // Create a new LevelEventPacket to broadcast the block break.
      const packet = new LevelEventPacket();
      packet.event = LevelEvent.ParticlesDestroyBlock;
      packet.position = BlockPosition.toVector3f(this.position);
      packet.data = this.permutation.network;

      // Broadcast the packet to the dimension.
      this.dimension.broadcast(packet);
    }

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
   * Gets the block's data as a database entry.
   * @returns The block entry object.
   */
  public getDataEntry(): BlockEntry {
    // Get the position of the block.
    const { x, y, z } = this.position;

    // Create the block entry object.
    const entry: BlockEntry = {
      identifier: this.type.identifier,
      permutation: this.permutation.network,
      position: [x, y, z],
      traits: [...this.traits.keys()],
      components: [...this.components.entries()]
    };

    // Return the block entry object.
    return entry;
  }

  public loadDataEntry(
    world: World,
    entry: BlockEntry,
    overwrite = true
  ): void {
    // Check if the block should be overwritten.
    if (overwrite) {
      this.traits.clear();
      this.components.clear();
    }

    // Add the components to the block, if it does not already exist.
    for (const [key, value] of entry.components) {
      if (!this.components.has(key)) this.components.set(key, value);
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
  }
}

export { Block };
