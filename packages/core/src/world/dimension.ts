import {
  BlockPosition,
  ChunkCoords,
  DataPacket,
  DimensionType,
  IPosition,
  TextPacket,
  TextPacketType,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket,
  Vector3f
} from "@serenityjs/protocol";

import {
  CommandResponse,
  DimensionProperties,
  EntityQueryOptions
} from "../types";
import {
  Entity,
  EntityCollisionTrait,
  EntityGravityTrait,
  EntityInventoryTrait,
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
import { CommandExecutionState } from "../commands";
import { BlockPermutationUpdateSignal } from "../events";

import { World } from "./world";
import { TerrainGenerator } from "./generator";
import { Chunk } from "./chunk";
import { TickSchedule } from "./schedule";
import { Structure } from "./structure";

const DefaultDimensionProperties: DimensionProperties = {
  identifier: "overworld",
  type: DimensionType.Overworld,
  generator: "void",
  viewDistance: 20,
  simulationDistance: 10,
  spawnPosition: [0, 32767, 0]
};

class Dimension {
  /**
   * The serenity instance of the server.
   */
  protected readonly serenity: Serenity;

  /**
   * The properties of the dimension.
   */
  public readonly properties: DimensionProperties = DefaultDimensionProperties;

  /**
   * The identifier of the dimension.
   */
  public readonly identifier: string;

  /**
   * The type of the dimension.
   */
  public readonly type: DimensionType;

  /**
   * The world that the dimension belongs to.
   */
  public readonly world: World;

  /**
   * The generator of the dimension.
   */
  public readonly generator: TerrainGenerator;

  /**
   * The entities in the dimension.
   */
  public readonly entities = new Map<bigint, Entity>();

  /**
   * The blocks in the dimension that contain data.
   */
  public readonly blocks = new Map<bigint, Block>();

  /**
   * The amount of chunks that that will be rendered by the client.
   */
  public get viewDistance(): number {
    return this.properties.viewDistance;
  }

  /**
   * The amount of chunks that that will be rendered by the client.
   */
  public set viewDistance(value: number) {
    this.properties.viewDistance = value;
  }

  /**
   * The distance in chunks that entities will be simulated.
   */
  public get simulationDistance(): number {
    return this.properties.simulationDistance;
  }

  /**
   * The distance in chunks that entities will be simulated.
   */
  public set simulationDistance(value: number) {
    this.properties.simulationDistance = value;
  }

  /**
   * The spawn position of the dimension.
   */
  public get spawnPosition(): Vector3f {
    // Get the spawn position from the properties
    const position = Vector3f.fromArray(this.properties.spawnPosition);

    // Find the spawn position if it is at the maximum height
    // This will determine the topmost block at the spawn position
    if (position.y >= 32767) {
      // Get the topmost block at the spawn position
      const block = this.getTopmostBlock(position);

      // Set the spawn position to the topmost block
      if (block) position.y = block.position.y + 4;
      // Set the spawn position to the topmost block
      else position.y = 0;

      // Set the spawn position in the properties
      this.spawnPosition = position;
    }

    // Return the spawn position
    return position;
  }

  /**
   * The spawn position of the dimension.
   */
  public set spawnPosition(value: Vector3f) {
    this.properties.spawnPosition = [value.x, value.y, value.z];
  }

  /**
   * Creates a new dimension for a world.
   * @param world The world that the dimension will belong to.
   * @param properties The properties of the dimension.
   */
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
    this.generator = new generator(this, { seed: world.properties.seed });

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
    // Get all the players in the dimension
    const players = this.getPlayers();

    // Check if there are no players in the dimension
    if (players.length === 0) return;

    // Get the current tick of the world
    const currentTick = this.world.currentTick;

    // Get all the player positions in the dimension.
    const playerPositions = players.map((player) => player.position);

    // Iterate over all the entities in the dimension
    for (const entity of this.getEntities()) {
      // Check if there is a entity within the simulation distance to tick the entity
      const inSimulationRange = playerPositions.some((player) => {
        return player.distance(entity.position) <= this.simulationDistance << 4;
      });

      // Tick the entity if it is in simulation range
      if (inSimulationRange) {
        // Check if the entity is not ticking
        if (!entity.isTicking) entity.isTicking = true;

        // Iterate over all the traits in the entity
        for (const [identifier, trait] of entity.traits)
          try {
            // Tick the trait
            trait.onTick?.({ currentTick, deltaTick });
          } catch (reason) {
            // Log the error to the console
            this.world.logger.error(
              `Failed to tick entity trait "${identifier}" for entity "${entity.type.identifier}:${entity.uniqueId}" in dimension "${this.identifier}"`,
              reason
            );

            // Remove the trait from the entity
            entity.traits.delete(identifier);
          }

        // Check if the entity has a inventory trait
        if (entity.hasTrait(EntityInventoryTrait)) {
          // Get the inventory trait from the entity
          const { container } = entity.getTrait(EntityInventoryTrait);

          // Iterate over all the items in the inventory
          for (const item of container.storage) {
            // Check if the item is null
            if (!item) continue;

            // Iterate over all the traits in the item
            for (const [identifier, trait] of item.traits)
              try {
                // Tick the item trait
                trait.onTick?.({ currentTick, deltaTick });
              } catch (reason) {
                // Log the error to the console
                this.world.logger.error(
                  `Failed to tick item trait "${identifier}" for item "${item.type.identifier}" in dimension "${this.identifier}"`,
                  reason
                );

                // Remove the trait from the item
                item.traits.delete(identifier);
              }
          }
        }
      } else if (entity.isTicking) {
        // If the entity is not in simulation range, stop ticking it
        entity.isTicking = false;
      }
    }

    // Iterate over all the blocks in the dimension
    for (const [, block] of this.blocks) {
      // Check if there is a player within the simulation distance to tick the block
      const inSimulationRange = playerPositions.some((player) => {
        return player.distance(block.position) <= this.simulationDistance << 4;
      });

      // Tick the block if it is in simulation range
      if (inSimulationRange) {
        // Check if the block is not ticking
        if (!block.isTicking) block.isTicking = true;

        // Iterate over all the traits in the block
        // Try to tick the block trait
        for (const [identifier, trait] of block.traits)
          try {
            trait.onTick?.({ currentTick, deltaTick });
          } catch (reason) {
            // Log the error to the console
            this.world.logger.error(
              `Failed to tick block trait "${identifier}" for block "${block.position.x}, ${block.position.y}, ${block.position.z}" in dimension "${this.identifier}"`,
              reason
            );

            // Remove the trait from the block
            block.traits.delete(identifier);
          }
      } else if (block.isTicking) {
        // If the block is not in simulation range, stop ticking it
        block.isTicking = false;
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
    // Generate the coordinate hash for the chunk
    const hash = ChunkCoords.hash({ x: cx, z: cz });

    // Check if the provider contains the dimensions
    if (!this.world.provider.chunks.has(this))
      // If not, create a new map for the dimension
      this.world.provider.chunks.set(this, new Map());

    // Fetch the chunks from the provider via the dimension
    const chunks = this.world.provider.chunks.get(this);

    // Check if the targeted chunk is cached, if so, return it
    if (chunks && chunks.has(hash)) return chunks.get(hash)!; // Check if the chunk is in the cache

    // Create a new chunk to pass to the provider
    const chunk = new Chunk(cx, cz, this.type);

    // Mark the chunk as not ready
    chunk.ready = false;

    // Await for the chunk to be generated
    this.world.provider.readChunk(chunk, this);

    return chunk; // Return the chunk
  }

  /**
   * Sets a chunk in the dimension.
   * @param chunk The chunk to set.
   */
  public setChunk(chunk: Chunk): void {
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
    return void this.world.provider.writeChunk(chunk, this);
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
      // Get the permutation from the chunk
      const permutation = this.getPermutation(blockPosition);

      // Create a new block with the dimension, position, and permutation
      const block = new Block(this, blockPosition);

      // Push the permutation nbt to the block's nbt
      block.nbt.push(...permutation.nbt.values());

      // Iterate over all the traits and apply them to the block
      for (const [, trait] of permutation.type.traits) block.addTrait(trait);

      // If the block has dynamic properties or traits, we will cache the block
      if (
        block.nbt.size > 0 ||
        block.dyanamicProperties.size > 0 ||
        block.traits.size > 0
      )
        this.blocks.set(hash, block);

      // Return the block
      return block;
    }
  }

  /**
   * Gets the topmost block in which the permutation is not air, at the given X and Z coordinates.
   * @param position The position to query.
   * @returns The topmost block in which the permutation is not air.
   */
  public getTopmostBlock(position: IPosition): Block {
    // Get the current chunk
    const chunk = this.getChunk(position.x >> 4, position.z >> 4);

    // Get the topmost level that is not air
    const topLevel = chunk.getTopmostLevel(position);

    // Return the block
    return this.getBlock({ ...position, y: topLevel });
  }
  /**
   * Get the permutation of a block at a given position.
   * This method won't construct a block instance.
   * @param position The position of the block.
   * @returns The block permutation at the specified position.
   */
  public getPermutation(position: IPosition, layer = 0): BlockPermutation {
    // Convert the position to a block position
    const blockPosition = BlockPosition.from(position);

    // Convert the block position to a chunk position
    const cx = blockPosition.x >> 4;
    const cz = blockPosition.z >> 4;

    // Get the chunk of the provided position
    const chunk = this.getChunk(cx, cz);

    // Get the permutation from the chunk
    const permutation = chunk.getPermutation(blockPosition, layer);

    // Return the permutation
    return permutation;
  }

  /**
   * Sets the permutation of a block at a given position.
   * @param position The position of the block.
   * @param permutation  The permutation to set.
   * @param layer The layer to set the permutation on.
   */
  public setPermutation(
    position: IPosition,
    permutation: BlockPermutation,
    layer = UpdateBlockLayerType.Normal
  ): void {
    // Convert the position to a block position
    const blockPosition = BlockPosition.from(position);

    // Create a new UpdateBlockPacket to broadcast the change.
    const packet = new UpdateBlockPacket();

    // Assign the block position and permutation to the packet.
    packet.networkBlockId = permutation.networkId;
    packet.position = blockPosition;
    packet.flags = UpdateBlockFlagsType.Network;
    packet.layer = layer;

    // Create a new BlockPermutationUpdateSignal
    const signal = new BlockPermutationUpdateSignal(
      this,
      blockPosition,
      permutation
    );

    // Emit the signal and check if it is cancelled
    if (!signal.emit()) {
      // Get the permutation of the block
      const permutation = this.getPermutation(blockPosition, layer);

      // Assign the permutation to the block
      packet.networkBlockId = permutation.networkId;

      // Broadcast the packet to the dimension.
      return this.broadcast(packet);
    }

    // Convert the block position to a chunk position
    const cx = blockPosition.x >> 4;
    const cz = blockPosition.z >> 4;

    // Get the chunk of the provided position
    const chunk = this.getChunk(cx, cz);

    // Set the permutation of the block
    chunk.setPermutation(blockPosition, permutation, layer, true);

    // Broadcast the packet to the dimension.
    this.broadcast(packet);
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
  public getPlayers(options?: EntityQueryOptions): Array<Player> {
    // Prepare an array to hold the players
    const players: Array<Player> = [];

    // Get the position, max distance, and min distance from the options
    const position = options?.position ?? { x: 0, y: 0, z: 0 };
    const maxDistance = options?.maxDistance ?? 0;
    const minDistance = options?.minDistance ?? 0;
    const maxCount = options?.count ?? Infinity;

    // Filter the players based on the options
    for (const [, player] of this.serenity.players) {
      // Check if the count is reached
      if (maxCount <= players.length) break;

      // Check if the player dimension is the same as this dimension
      if (player.dimension !== this) continue;

      // Check if the player is within the maximum distance
      if (maxDistance > 0 && player.position.distance(position) > maxDistance)
        continue;

      // Check if the player is within the minimum distance
      if (minDistance > 0 && player.position.distance(position) < minDistance)
        continue;

      // Add the player to the player list
      players.push(player);
    }

    // Return the filtered players
    return players;
  }

  /**
   * Gets an entity from the dimension.
   * @param id The id of the entity, either unique id or runtime id.
   * @param runtimeId Whether to get the entity by runtime id; defaults to false.
   * @returns The entity if found, otherwise null.
   */
  public getEntity(id: bigint, runtimeId = false): Entity | null {
    // Check if the provided id is a runtime id
    // If not, we will get the entity by the unique id
    if (!runtimeId) return this.entities.get(id) ?? null;

    // Iterate over all the entities in the dimension
    for (const entity of this.entities.values())
      if (entity.runtimeId === id) return entity; // Check if runtime id matches

    // Return null if the entity is not found
    return null;
  }

  /**
   * Gets all the entities in the dimension.
   * @returns An array of entities.
   * @param options The options to filter the entities.
   * @returns An array of entities.
   */
  public getEntities(options?: EntityQueryOptions): Array<Entity> {
    // Prepare an array to hold the entities
    const entities: Array<Entity> = [];

    // Get the position, max distance, and min distance from the options
    const position = options?.position ?? { x: 0, y: 0, z: 0 };
    const maxDistance = options?.maxDistance ?? 0;
    const minDistance = options?.minDistance ?? 0;
    const maxCount = options?.count ?? Infinity;
    const chunk = options?.chunk ?? null;

    // Filter the entities based on the options
    for (const entity of this.entities.values()) {
      // Check if the count is reached
      if (maxCount <= entities.length) break;

      //Check if the entity is within the maximum distance
      if (maxDistance > 0 && entity.position.distance(position) > maxDistance)
        continue;

      // Check if the entity is within the minimum distance
      if (minDistance > 0 && entity.position.distance(position) < minDistance)
        continue;

      // Check if the entity is in the specified chunk
      if (chunk) {
        // Get the position of the entity
        const position = entity.position.floor();

        // Convert the position to chunk coordinates
        const cx = position.x >> 4;
        const cz = position.z >> 4;

        // Check if the entity is in the specified chunk
        if (cx !== chunk.x || cz !== chunk.z) continue;
      }

      // Add the entity to the entity list
      entities.push(entity);
    }

    // Return the filtered entities
    return entities;
  }

  /**
   * Fills a region with a permutation.
   * @param from The starting position.
   * @param to The ending position.
   * @param permutation The permutation to fill the region with.
   * @returns The amount of blocks that were filled.
   */
  public fill(
    from: IPosition,
    to: IPosition,
    permutation: BlockPermutation
  ): number {
    // Get the min and max coordinates
    const minX = Math.min(from.x, to.x);
    const minY = Math.min(from.y, to.y);
    const minZ = Math.min(from.z, to.z);
    const maxX = Math.max(from.x, to.x);
    const maxY = Math.max(from.y, to.y);
    const maxZ = Math.max(from.z, to.z);

    // Hold the updated chunks
    const updatedChunks = new Set<Chunk>();

    // Hold the amount of blocks that were filled
    let filledBlocks = 0;

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

          // Increment the filled blocks
          filledBlocks++;
        }
      }
    }

    // Set the updated chunks
    for (const chunk of updatedChunks) this.setChunk(chunk);

    // Return the amount of blocks that were filled
    return filledBlocks;
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
    entity.addTrait(EntityCollisionTrait);

    // Set the entity position
    entity.position.x = position.x;
    entity.position.y = position.y + 1;
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
  public spawnItem(itemStack: ItemStack, position: IPosition): Entity {
    // Create a new Entity instance
    const entity = new Entity(this, EntityIdentifier.Item);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.world;

    // Set the entity position
    entity.position.x = position.x;
    entity.position.y = position.y;
    entity.position.z = position.z;

    // Create a new item trait, this will register the item to the entity
    entity.addTrait(EntityItemStackTrait, { itemStack });

    // Add gravity and physics traits to the entity
    entity.addTrait(EntityGravityTrait);
    entity.addTrait(EntityPhysicsTrait);
    entity.addTrait(EntityMovementTrait);
    entity.addTrait(EntityCollisionTrait);

    // Spawn the item entity
    entity.spawn();

    // Return the item entity
    return entity;
  }

  /**
   * Executes a command in the dimension.
   * @param command The command to execute.
   * @returns The response of the command.
   */
  public executeCommand<T = unknown>(command: string): CommandResponse<T> {
    // Check if the command starts with a slash, remove it if it does not
    if (command.startsWith("/")) command = command.slice(1);

    // Create a new command execute state
    const state = new CommandExecutionState(
      this.world.commandPalette.getAll(),
      command,
      this
    );

    // Execute the command state
    return state.execute() as CommandResponse<T>;
  }

  /**
   * Executes a command in the dimension asynchronously.
   * @param command The command to execute.
   * @returns The response of the command.
   */
  public async executeCommandAsync<T = unknown>(
    command: string
  ): Promise<CommandResponse<T>> {
    // Check if the command starts with a slash, remove it if it does not
    if (command.startsWith("/")) command = command.slice(1);

    // Create a new command execute state
    const state = new CommandExecutionState(
      this.world.commandPalette.getAll(),
      command,
      this
    );

    // Execute the command state
    return (await state.execute()) as Promise<CommandResponse<T>>;
  }

  /**
   * Schedule an execution of a function after a specified amount of ticks.
   * @param ticks The amount of ticks to wait before the schedule is complete.
   * @returns The created tick schedule.
   */
  public schedule(ticks: number): TickSchedule {
    // Create a new tick schedule
    const schedule = new TickSchedule(ticks, this);

    // Add the schedule to the world
    this.serenity.schedules.add(schedule);

    // Return the schedule
    return schedule;
  }

  /**
   * Schedules an execution of a function after a specified amount of ticks asynchronously.
   * @param ticks The amount of ticks to wait before the schedule is complete.
   * @returns A promise that resolves when the schedule is complete.
   */
  public async scheduleAsync(ticks: number): Promise<void> {
    return new Promise<void>((resolve) => this.schedule(ticks).on(resolve));
  }

  /**
   * Place a structure in the dimension at a specified position.
   * @param identifier The identifier of the structure or the structure instance itself.
   * @param position The position to place the structure at.
   * @throws Will throw an error if the structure is not found.
   */
  public placeStructure(
    identifier: string | Structure,
    position: IPosition
  ): void {
    // Get the structure from the identifier
    const structure =
      typeof identifier === "string"
        ? this.world.structures.get(identifier)
        : identifier;

    // Check if the structure exists
    if (!structure) throw new Error(`Structure "${identifier}" not found.`);

    // Create a set to hold the dirty chunks
    const dirtyChunks = new Set<Chunk>();

    // Prepare an index to iterate over the blocks
    let index = 0;
    for (let x = 0; x < structure.size[0]; x++) {
      for (let y = 0; y < structure.size[1]; y++) {
        for (let z = 0; z < structure.size[2]; z++) {
          // Get palette index and permutation hash
          const paletteIndex = structure.blocks[index] ?? 0;
          const permutationHash = structure.palette[paletteIndex] ?? 0;

          // Get the permutation from the block palette
          const permutation =
            this.world.blockPalette.permutations.get(permutationHash);

          // Check if the permutation exists
          if (!permutation) continue;

          // Calculate the position of the block
          const dx = x + position.x;
          const dy = y + position.y;
          const dz = z + position.z;

          // Get the chunk of the block
          const chunk = this.getChunk(dx >> 4, dz >> 4);

          // Set the permutation of the block
          chunk.setPermutation(
            { x: dx, y: dy, z: dz },
            permutation,
            UpdateBlockLayerType.Normal,
            true
          );

          // Add the chunk to the dirty chunks
          if (!dirtyChunks.has(chunk)) dirtyChunks.add(chunk);

          // Increment the index
          index++;
        }
      }
    }

    // Set the dirty chunks
    for (const chunk of dirtyChunks) {
      this.setChunk(chunk); // Set the chunk in the dimension
    }
  }

  /**
   * Place a structure in the dimension at a specified position asynchronously.
   * @param identifier The identifier of the structure or the structure instance itself.
   * @param position The position to place the structure at.
   * @param ticks The amount of ticks to wait before placing the next batch of blocks.
   * @param blocksPerTick The amount of blocks to place per tick.
   * @throws Will throw an error if the structure is not found.
   */
  public async placeStructureAsync(
    identifier: string | Structure,
    position: IPosition,
    ticks: number = 1,
    blocksPerTick: number = 50000
  ): Promise<void> {
    // Get the structure from the identifier
    const structure =
      typeof identifier === "string"
        ? this.world.structures.get(identifier)
        : identifier;

    // Check if the structure exists
    if (!structure) throw new Error(`Structure "${identifier}" not found.`);

    const [sx, sy, sz] = structure.size; // Get the size of the structure
    let index = 0; // Prepare an index to iterate over the blocks

    // Create a set to hold the dirty chunks
    const dirtyChunks = new Set<Chunk>();

    for (let x = 0; x < sx; x++) {
      for (let y = 0; y < sy; y++) {
        for (let z = 0; z < sz; z++) {
          // Get palette index and permutation hash
          const paletteIndex = structure.blocks[index] ?? 0;
          const permutationHash = structure.palette[paletteIndex] ?? 0;

          // Get the permutation from the block palette
          const permutation =
            this.world.blockPalette.permutations.get(permutationHash);

          // Check if the permutation exists
          if (!permutation) continue;

          // Calculate the position of the block
          const dx = x + position.x;
          const dy = y + position.y;
          const dz = z + position.z;

          // Get the chunk of the block
          const chunk = this.getChunk(dx >> 4, dz >> 4);

          // Set the permutation of the block
          chunk.setPermutation(
            { x: dx, y: dy, z: dz },
            permutation,
            UpdateBlockLayerType.Normal,
            true
          );

          // Add the chunk to the updated chunks
          if (!dirtyChunks.has(chunk)) dirtyChunks.add(chunk);

          // Increment the index
          index++;

          // Check if we reached the blocks per tick limit
          if (index % blocksPerTick === 0) await this.scheduleAsync(ticks); // Wait for the specified ticks
        }
      }
    }

    // Set the updated chunks
    for (const chunk of dirtyChunks) {
      this.setChunk(chunk); // Set the chunk in the dimension
    }
  }

  /**
   * Broadcast packets to all the players in the dimension.
   * @param packets The packets to broadcast.
   */
  public broadcast(...packets: Array<DataPacket>): void {
    // Iterate over all the entities in the dimension
    for (const player of this.getPlayers()) player.send(...packets); // Send the packet to the player
  }

  /**
   * Broadcast packets to all the players in the dimension immediately.
   * This will bypass the RakNet queue and send the packets immediately.
   * @param packets The packets to broadcast.
   */
  public broadcastImmediate(...packets: Array<DataPacket>): void {
    // Iterate over all the entities in the dimension
    for (const player of this.getPlayers()) player.sendImmediate(...packets); // Send the packet to the player
  }

  /**
   * Broadcast packets to all the players in the dimension except the specified player.
   * @param player The player to exclude from the broadcast.
   * @param packets The packets to broadcast.
   */
  public broadcastExcept(
    excludedPlayer: Player,
    ...packets: Array<DataPacket>
  ): void {
    // Iterate over all the entities in the dimension
    for (const player of this.getPlayers())
      if (excludedPlayer !== player) player.send(...packets); // Send the packet to the player
  }
}

export { Dimension, DefaultDimensionProperties };
