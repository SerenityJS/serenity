import { EntityLevelStorage, PlayerLevelStorage } from "../../entity";
import { BlockLevelStorage } from "../../block";
import { Serenity } from "../../serenity";
import { WorldProperties, WorldProviderProperties } from "../../types";
import { Chunk } from "../chunk/chunk";
import { Dimension } from "../dimension";
import { World } from "../world";

/**
 * The default world provider properties.
 */
const DefaultWorldProviderProperties: WorldProviderProperties = {
  path: "./worlds"
};

class WorldProvider {
  /**
   * The identifier of the provider.
   */
  public static readonly identifier: string;

  /**
   * The identifier of the provider.
   */
  public readonly identifier = (this.constructor as typeof WorldProvider)
    .identifier;

  /**
   * The cached chunks for the provider.
   */
  public readonly chunks: Map<Dimension, Map<bigint, Chunk>> = new Map();

  /**
   * The world that the provider belongs to.
   */
  public world!: World;

  /**
   * Create a new world provider.
   * @param parameters The parameters to use for the provider.
   */
  public constructor(..._parameters: Array<unknown>) {
    return this;
  }

  /**
   * Called when the provider is started.
   */
  public onStartup(): void {}

  /**
   * Called when the provider is shutdown.
   */
  public onShutdown(): void {}

  /**
   * Called when the provider is saved.
   */
  public onSave(): void {}

  /**
   * Reads a buffer from the provider.
   * @param key The key to read the buffer from.
   * @returns The buffer data entry.
   */
  public readBuffer(_key: string): Buffer {
    throw new Error(`${this.identifier}.readBuffer() is not implemented!`);
  }

  /**
   * Writes a buffer to the provider.
   * @param key The key to write the buffer to.
   * @param value The buffer data to write.
   */
  public writeBuffer(_key: string, _value: Buffer): void {
    throw new Error(`${this.identifier}.writeBuffer() is not implemented!`);
  }

  /**
   * Read a chunk for a specified dimension from the provider.
   * @param chunk The chunk where the data will be written to.
   * @param dimension The dimension to read the chunk from.
   */
  public async readChunk(_chunk: Chunk, _dimension: Dimension): Promise<Chunk> {
    throw new Error(`${this.identifier}.readChunk() is not implemented!`);
  }

  /**
   * Writes a chunk for a specified dimension to the provider.
   * @param chunk The chunk to write.
   * @param dimension The dimension to write the chunk to.
   */
  public async writeChunk(_chunk: Chunk, _dimension: Dimension): Promise<void> {
    throw new Error(`${this.identifier}.writeChunk() is not implemented!`);
  }

  public readChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<EntityLevelStorage> {
    throw new Error(`${this.identifier}.readEntities() is not implemented!`);
  }

  public writeChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension,
    _entities: Array<EntityLevelStorage>
  ): void {
    throw new Error(`${this.identifier}.writeEntities() is not implemented!`);
  }

  public readChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<BlockLevelStorage> {
    throw new Error(`${this.identifier}.readBlocks() is not implemented!`);
  }

  public writeChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension,
    _blocks: Array<BlockLevelStorage>
  ): void {
    throw new Error(`${this.identifier}.writeBlocks() is not implemented!`);
  }

  /**
   * Reads a players data from the provider.
   * @param uuid The uuid of the player to read.
   * @returns The player data if found, otherwise null.
   */
  public readPlayer(_uuid: string): PlayerLevelStorage | null {
    throw new Error(`${this.identifier}.readPlayer() is not implemented!`);
  }

  /**
   * Writes a players data to the provider.
   * @param player The player data to write.
   */
  public writePlayer(_player: PlayerLevelStorage): void {
    throw new Error(`${this.identifier}.writePlayer() is not implemented!`);
  }

  /**
   * Initializes the provider with the specified properties.
   * @param serenity The serenity instance to use.
   * @param properties The properties to use for the provider.
   */
  public static async initialize(
    _serenity: Serenity,
    _properties: WorldProviderProperties
  ): Promise<void> {
    throw new Error(`${this.identifier}.initialize() is not implemented!`);
  }

  public static async create(
    _serenity: Serenity,
    _properties: WorldProviderProperties,
    _worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    throw new Error(`${this.identifier}.create() is not implemented!`);
  }
}

export { WorldProvider, DefaultWorldProviderProperties };
