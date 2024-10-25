import {
  BlockPosition,
  DataPacket,
  DimensionType,
  IPosition,
  TextPacket,
  TextPacketType,
  Vector3f
} from "@serenityjs/protocol";

import { DimensionProperties, Items } from "../types";
import {
  Entity,
  EntityGravityTrait,
  EntityItemStackTrait,
  EntityMovementTrait,
  EntityPhysicsTrait,
  EntityType,
  Player,
  PlayerChunkRenderingTrait
} from "../entity";
import { Block, BlockPermutation } from "../block";
import { ItemStack } from "../item";
import { EntityIdentifier } from "../enums";
import { Serenity } from "../serenity";

import { World } from "./world";
import { TerrainGenerator } from "./generator";
import { Chunk } from "./chunk";

const DefaultDimensionProperties: DimensionProperties = {
  identifier: "overworld",
  type: DimensionType.Overworld,
  generator: "void"
};

class Dimension {
  protected readonly serenity: Serenity;

  public readonly properties: DimensionProperties = DefaultDimensionProperties;

  public readonly identifier: string;

  public readonly type: DimensionType;

  public readonly world: World;

  public readonly generator: TerrainGenerator;

  public readonly entities = new Map<bigint, Entity>();

  public readonly blocks = new Map<bigint, Block>();

  public viewDistance: number = 16;

  public simulationDistance: number = 8;

  public constructor(world: World, properties?: DimensionProperties) {
    // Assign the serenity instance & world
    this.serenity = world.serenity;
    this.world = world;

    // Assign the properties to the dimension with the default properties
    this.properties = { ...DefaultDimensionProperties, ...properties };

    // Get the generator from the serenity instance
    const generator = this.serenity.getGenerator(this.properties.generator);

    // Check if the generator exists
    if (!generator)
      throw new Error(
        `Failed to find generator "${this.properties.generator}" for dimension "${this.properties.identifier}"`
      );

    // Assign the generator to the dimension
    this.generator = new generator({ seed: world.properties.seed });

    // Assign the identifier and type
    this.identifier = this.properties.identifier;
    this.type = this.properties.type;
  }

  /**
   * Gets the dimension index in the world.
   * @returns The dimension index.
   */
  public indexOf(): number {
    return [...this.world.dimensions.values()].indexOf(this);
  }

  /**
   * Ticks the dimension with a given delta tick.
   * @param deltaTick The delta tick to tick the dimension with.
   */
  public onTick(deltaTick: number): void {
    // Check if there are no players in the dimension
    if (this.getPlayers().length === 0) return;

    // Get the positions of all the players in the dimension
    const positions = this.getPlayers().map((player) => player.position);

    // Iterate over all the entities in the dimension
    for (const entity of this.entities.values()) {
      // Check if there is a player within the simulation distance to tick the entity
      const inSimulationRange = positions.some((position) => {
        const distance = position.distance(entity.position);
        return distance <= this.simulationDistance << 4;
      });

      // Tick the entity if it is in simulation range
      if (inSimulationRange) {
        // Iterate over all the traits in the entity
        for (const trait of entity.traits.values())
          try {
            // Tick the trait
            trait.onTick?.(deltaTick);
          } catch (reason) {
            // Log the error to the console
            this.world.logger.error(
              `Failed to tick entity trait "${trait.identifier}" for entity "${entity.type.identifier}:${entity.uniqueId}" in dimension "${this.identifier}"`,
              reason
            );

            // Remove the trait from the entity
            entity.traits.delete(trait.identifier);
          }
      }
    }

    // Iterate over all the blocks in the dimension
    for (const block of this.blocks.values()) {
      // Get the block position
      const position = new Vector3f(
        block.position.x,
        block.position.y,
        block.position.z
      );

      // Check if there is a player within the simulation distance to tick the block
      const inSimulationRange = positions.some((player) => {
        const distance = player.distance(position);
        return distance <= this.simulationDistance;
      });

      // Tick the block if it is in simulation range
      if (inSimulationRange) {
        // Iterate over all the traits in the block
        // Try to tick the block trait
        for (const trait of block.traits.values())
          try {
            trait.onTick?.(deltaTick);
          } catch (reason) {
            // Log the error to the console
            this.world.logger.error(
              `Failed to tick block trait "${trait.identifier}" for block "${block.position.x}, ${block.position.y}, ${block.position.z}" in dimension "${this.identifier}"`,
              reason
            );

            // Remove the trait from the block
            block.traits.delete(trait.identifier);
          }
      }
    }
  }

  /**
   * Gets a chunk from the dimension.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   * @returns The chunk at the specified coordinates.
   */
  public getChunk(cx: number, cz: number): Chunk {
    // Read the chunk from the provider
    const chunk = this.world.provider.readChunk(cx, cz, this);

    // Return the chunk
    return chunk;
  }

  /**
   * Sets a chunk in the dimension.
   * @param chunk The chunk to set.
   */
  public setChunk(chunk: Chunk): void {
    // Create a new ChunkWriteSignal
    // const signal = new ChunkWriteSignal(chunk, this);
    // const value = signal.emit();

    // Check if the signal was attempted to be cancelled
    // if (value === false)
    //   // Log a warning to the console, as this signal cannot be cancelled
    //   this.world.logger.warn(
    //     `Chunk write signal cannot be cancelled, chunk: ${chunk.x}, ${chunk.z}`
    //   );

    // Iterate over all the players in the dimension
    for (const player of this.getPlayers()) {
      // Get the player's chunk rendering trait
      const trait = player.getTrait(PlayerChunkRenderingTrait);

      // Check if the player has the chunk being set
      if (!trait.chunks.has(chunk.hash)) continue;

      // Send the chunk to the player
      trait.send(chunk);
    }

    // Write the chunk to the provider
    return this.world.provider.writeChunk(chunk, this);
  }

  /**
   * Gets a block from the dimension.
   * @param position The position of the block.
   * @returns The block at the specified position.
   */
  public getBlock(position: IPosition): Block {
    // Convert the position to a block position
    const blockPosition = BlockPosition.from(position);

    // Calculate the block hash using the position
    const hash = BlockPosition.hash(blockPosition);

    // Get the block from the block cache
    const block = this.blocks.get(hash);

    // Return the block if it exists
    if (block) return block;
    else {
      // Convert the block position to a chunk position
      const cx = blockPosition.x >> 4;
      const cz = blockPosition.z >> 4;

      // Get the current chunk the block will be in
      const chunk = this.getChunk(cx, cz);

      // Get the permutation from the chunk
      const permutation = chunk.getPermutation(blockPosition);

      // Create a new block with the dimension, position, and permutation
      const block = new Block(this, blockPosition, permutation);

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
          // Check if the trait identifier matches the key
          if (trait.identifier === key) {
            // Add the trait to the traits list
            traits.push(trait);
          }
        }
      }

      // Iterate over all the traits and apply them to the block
      for (const trait of traits) block.addTrait(trait);

      // If the block has components or traits, we will cache the block
      if (block.components.size > 0 || block.traits.size > 0)
        this.blocks.set(hash, block);

      // Return the block
      return block;
    }
  }

  /**
   * Get the permutation of a block at a given position.
   * This method won't construct a block instance.
   * @param position The position of the block.
   * @returns The block permutation at the specified position.
   */
  public getPermutation(position: IPosition): BlockPermutation {
    // Convert the position to a block position
    const blockPosition = position as BlockPosition;

    // Convert the block position to a chunk position
    const cx = blockPosition.x >> 4;
    const cz = blockPosition.z >> 4;

    // Get the chunk of the provided position
    const chunk = this.getChunk(cx, cz);

    // Get the permutation from the chunk
    return chunk.getPermutation({ x: cx, y: blockPosition.y, z: cz });
  }

  /**
   * Broadcasts a message to all players in the dimension.
   * @param message The message to broadcast.
   */
  public sendMessage(message: string): void {
    // Construct the text packet.
    const packet = new TextPacket();

    // Assign the packet data.
    packet.type = TextPacketType.Raw;
    packet.needsTranslation = false;
    packet.source = null;
    packet.message = message;
    packet.parameters = null;
    packet.xuid = "";
    packet.platformChatId = "";
    packet.filtered = message;

    // Send the packet.
    this.broadcast(packet);
  }

  /**
   * Gets all the players in the dimension.
   * @returns An array of players.
   */
  public getPlayers(): Array<Player> {
    return [...this.entities.values()].filter((entity) => entity.isPlayer());
  }

  /**
   * Gets an entity from the dimension.
   */
  public getEntity(id: bigint, runtimeId = false): Entity | null {
    // Check if the provided id is a runtime id
    // If not, we will get the entity by the unique id
    if (!runtimeId) return this.entities.get(id) ?? null;
    // If the id is a runtime id, we will get the entity by the runtime id
    else
      return (
        [...this.entities.values()].find((entity) => entity.runtimeId === id) ||
        null
      );
  }

  /**
   * Gets all the entities in the dimension.
   * @returns An array of entities.
   */
  public getEntities(): Array<Entity> {
    return [...this.entities.values()];
  }

  /**
   * Fills a region with a permutation.
   * @param from The starting position.
   * @param to The ending position.
   * @param permutation The permutation to fill the region with.
   */
  public fill(
    from: IPosition,
    to: IPosition,
    permutation: BlockPermutation
  ): void {
    // Get the min and max coordinates
    const minX = Math.min(from.x, to.x);
    const minY = Math.min(from.y, to.y);
    const minZ = Math.min(from.z, to.z);
    const maxX = Math.max(from.x, to.x);
    const maxY = Math.max(from.y, to.y);
    const maxZ = Math.max(from.z, to.z);

    // Hold the updated chunks
    const updatedChunks = new Set<Chunk>();

    // Iterate over the coordinates
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          // Get the chunk of the block
          const chunk = this.getChunk(x >> 4, z >> 4);

          // Set the permutation of the block
          chunk.setPermutation({ x, y, z }, permutation);

          // Add the chunk to the updated chunks
          updatedChunks.add(chunk);

          // Set the chunk to dirty
          chunk.dirty = true;
        }
      }
    }

    // Set the updated chunks
    for (const chunk of updatedChunks) this.setChunk(chunk);
  }

  /**
   * Spawns an entity in the dimension.
   * @param type The type of the entity.
   * @param position The position of the entity.
   * @returns The entity that was spawned.
   */
  public spawnEntity(
    type: EntityIdentifier | EntityType,
    position: Vector3f
  ): Entity {
    // Create a new Entity instance with the dimension and type
    const entity = new Entity(this, type);

    // As a Serenity standard, we will add the gravity, physics, movement traits to the entity
    entity.addTrait(EntityGravityTrait);
    entity.addTrait(EntityPhysicsTrait);
    entity.addTrait(EntityMovementTrait);

    // Set the entity position
    entity.position.x = position.x;
    entity.position.y = position.y;
    entity.position.z = position.z;

    // Spawn the entity
    return entity.spawn();
  }

  /**
   * Spawns an item in the dimension.
   *
   * @param itemStack The item stack of the item.
   * @param position The position of the item.
   * @returns The entity that was spawned.
   */
  public spawnItem<T extends keyof Items>(
    itemStack: ItemStack<T>,
    position: Vector3f
  ): Entity {
    // Create a new Entity instance
    const entity = new Entity(this, EntityIdentifier.Item);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.world;

    // Set the entity position
    entity.position.x = position.x;
    entity.position.y = position.y;
    entity.position.z = position.z;

    // Create a new item trait, this will register the item to the entity
    const trait = new EntityItemStackTrait(entity);
    trait.itemStack = itemStack;

    // Add gravity and physics traits to the entity
    entity.addTrait(EntityGravityTrait);
    entity.addTrait(EntityPhysicsTrait);
    entity.addTrait(EntityMovementTrait);

    // Spawn the item entity
    entity.spawn();

    // Return the item entity
    return entity;
  }

  /**
   * Broadcast packets to all the players in the dimension.
   * @param packets The packets to broadcast.
   */
  public broadcast(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.send(...packets);
  }

  /**
   * Broadcast packets to all the players in the dimension immediately.
   * @param packets The packets to broadcast.
   */
  public broadcastImmediate(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.sendImmediate(...packets);
  }

  /**
   * Broadcast packets to all the players in the dimension except the specified player.
   * @param player The player to exclude from the broadcast.
   * @param packets The packets to broadcast.
   */
  public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
    // Check if the entity is a player and is not the player to exclude
    for (const entity of this.entities.values())
      if (entity.isPlayer() && entity !== player) entity.send(...packets);
  }
}

export { Dimension, DefaultDimensionProperties };
