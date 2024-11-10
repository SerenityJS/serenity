import {
  BlockFace,
  BlockPosition,
  Gamemode,
  LevelEvent,
  LevelEventPacket,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket,
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
import { BlockIdentifier, BlockToolType, ItemIdentifier } from "../enums";
import { Serenity } from "../serenity";
import { Player } from "../entity";
import { PlayerInteractWithBlockSignal } from "../events";

import { BlockTrait } from "./traits";
import { NbtMap } from "./maps";

import { BlockPermutation, BlockType } from ".";

class Block {
  protected serenity: Serenity;

  public readonly dimension: Dimension;

  public readonly position: BlockPosition;

  public readonly components = new Map<string, JSONLikeValue>();

  public readonly traits = new Map<string, BlockTrait>();

  public readonly nbt = new NbtMap(this);

  public permutation: BlockPermutation;

  public constructor(
    dimension: Dimension,
    position: BlockPosition,
    permutation: BlockPermutation,
    properties?: Partial<BlockProperties>
  ) {
    this.serenity = dimension.world.serenity;
    this.dimension = dimension;
    this.position = position;
    this.permutation = permutation;

    if (properties?.entry)
      this.loadDataEntry(this.dimension.world, properties.entry);
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

  public getPermutation(): BlockPermutation {
    return this.permutation;
  }

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

    // Get the chunk the block is in.
    const chunk = this.getChunk();

    // Set the permutation of the block.
    chunk.setPermutation(this.position, permutation);

    // Check if the entry is provided.
    if (entry) this.loadDataEntry(this.getWorld(), entry);

    // Get the traits from the block palette
    const traits = this.getWorld().blockPalette.getRegistry(
      permutation.type.identifier
    );

    // Fetch any traits that apply to the base type components
    for (const identifier of permutation.type.components) {
      // Get the trait from the block palette using the identifier
      const trait = this.getWorld().blockPalette.getTrait(identifier);

      // Check if the trait exists
      if (trait) traits.push(trait);
    }

    // Fetch any traits that are block state specific
    for (const key of Object.keys(permutation.state)) {
      // Iterate over the trait in the registry.
      for (const trait of this.getWorld().blockPalette.getAllTraits()) {
        // Check if the trait identifier matches the key
        if (trait.identifier === key) {
          // Add the trait to the traits list
          traits.push(trait);
        }
      }
    }

    // Iterate over all the traits and apply them to the block
    for (const trait of traits) this.addTrait(trait);

    // Create a new UpdateBlockPacket to broadcast the change.
    const packet = new UpdateBlockPacket();

    // Assign the block position and permutation to the packet.
    packet.networkBlockId = permutation.network;
    packet.position = this.position;
    packet.flags = UpdateBlockFlagsType.Network;
    packet.layer = UpdateBlockLayerType.Normal;

    // Broadcast the packet to the dimension.
    this.dimension.broadcast(packet);

    // Update the permutation of the block.
    this.permutation = permutation;

    // Check if the block should be cached.
    if ((this.components.size > 0 || this.traits.size > 0) && !this.isAir()) {
      // Calculate the block hash using the position
      const hash = BlockPosition.hash(this.position);

      // Set the block in the cache.
      this.dimension.blocks.set(hash, this);
    }
  }

  public setType(type: BlockType): void {
    this.setPermutation(type.getPermutation());
  }

  public getType(): BlockType {
    return this.permutation.type;
  }

  public getWorld() {
    return this.dimension.world;
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
    this.traits.delete(typeof trait === "string" ? trait : trait.identifier);
  }

  /**
   * Adds a trait to the block.
   * @param trait The trait to add
   * @returns The trait that was added
   */
  public addTrait(trait: typeof BlockTrait): void {
    // Check if the trait already exists
    if (this.traits.has(trait.identifier)) return;

    // Check if the trait is in the palette
    if (!this.getWorld().blockPalette.traits.has(trait.identifier))
      this.getWorld().logger.warn(
        `Trait "§c${trait.identifier}§r" was added to block "§d${this.getType().identifier}§r:§d${JSON.stringify(this.position)}§r" in dimension "§a${this.dimension.identifier}§r" but does not exist in the palette. This may result in a deserilization error.`
      );

    // Attempt to add the trait to the block
    try {
      // Create a new instance of the trait
      new trait(this);
    } catch (reason) {
      // Log the error to the console
      this.serenity.logger.error(
        `Failed to add trait "${trait.identifier}" to block "${this.getType().identifier}:${JSON.stringify(this.position)}" in dimension "${this.dimension.identifier}"`,
        reason
      );
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
    // Get the block type.
    const blockType = this.getType();

    // If the hardness is less than 0, no tool is compatible.
    if (blockType.hardness < 0) return false;

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
    // Get the type of the block.
    const type = this.getType();

    // Get the hardness of the block.
    let hardness = type.hardness;

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
    const palette = this.getWorld().itemPalette;

    // Get the item type of the block.
    const type = palette.resolveType(this.getType()) as ItemType;

    // Create a new item stack with the type.
    const itemStack = new ItemStack(type, properties);

    // Return the item stack.
    return itemStack;
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
        for (const drop of this.getType().drops) {
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

    // Get the air block permutation.
    const air = BlockPermutation.resolve(BlockIdentifier.Air);

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
      identifier: this.getType().identifier,
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
          `Failed to load trait "${trait}" for block "${this.getType().identifier}:${this.position.x},${this.position.y},${this.position.z}" as it does not exist in the palette`
        );

        continue;
      }

      // Attempt to add the trait to the block
      this.addTrait(traitType);
    }
  }
}

export { Block };
