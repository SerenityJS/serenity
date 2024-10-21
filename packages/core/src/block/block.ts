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

import { Dimension } from "../world";
import { JSONLikeValue } from "../types";
import { Chunk } from "../world/chunk";
import { ItemStack } from "../item";
import { BlockIdentifier, BlockToolType, ItemIdentifier } from "../enums";
import { Serenity } from "../serenity";
import { Player } from "../entity";

import { BlockTrait } from "./traits";

import { BlockPermutation, BlockType } from ".";

class Block {
  protected serenity: Serenity;

  public readonly dimension: Dimension;

  public readonly position: BlockPosition;

  public readonly components = new Map<string, JSONLikeValue>();

  public readonly traits = new Map<string, BlockTrait>();

  public permutation: BlockPermutation;

  public constructor(
    dimension: Dimension,
    position: BlockPosition,
    permutation: BlockPermutation
  ) {
    this.serenity = dimension.world.serenity;
    this.dimension = dimension;
    this.position = position;
    this.permutation = permutation;
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

  public setPermutation(permutation: BlockPermutation): void {
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
  }

  public getType(): BlockType {
    return this.permutation.type;
  }

  public getWorld() {
    return this.dimension.world;
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
  public interact(player: Player): void {
    // Call the block onInteract trait methods
    for (const trait of this.traits.values()) {
      trait.onInteract?.(player);
    }
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
            amount
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
}

export { Block };
