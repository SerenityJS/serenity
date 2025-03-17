import { Serenity } from "../../serenity";
import {
  BlockEntry,
  EntityEntry,
  PlayerEntry,
  WorldProperties,
  WorldProviderProperties
} from "../../types";
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
   * Reads a chunk for a specified dimension from the provider.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   * @param dimension The dimension to read the chunk from.
   */
  public readChunk(_cx: number, _cz: number, _dimension: Dimension): Chunk {
    throw new Error(`${this.identifier}.readChunk() is not implemented!`);
  }

  /**
   * Writes a chunk for a specified dimension to the provider.
   * @param chunk The chunk to write.
   * @param dimension The dimension to write the chunk to.
   */
  public writeChunk(_chunk: Chunk, _dimension: Dimension): void {
    throw new Error(`${this.identifier}.writeChunk() is not implemented!`);
  }

  /**
   * Reads the available entities for a specified dimension.
   * @param dimension The dimension to get the available entities for.
   * @returns The available entities.
   */
  public readAvailableEntities(_dimension: Dimension): Array<bigint> {
    throw new Error(
      `${this.identifier}.getAvailableEntities() is not implemented!`
    );
  }

  /**
   * Writes the available entities for a specified dimension.
   * @param dimension The dimension to write the available entities for.
   * @param entities The entities to write.
   */
  public writeAvailableEntities(
    _dimension: Dimension,
    _entities: Array<bigint>
  ): void {
    throw new Error(
      `${this.identifier}.writeAvailableEntities() is not implemented!`
    );
  }

  /**
   * Reads an entity from the provider.
   * @param uniqueId The unique identifier of the entity to read.
   * @param dimension The dimension to read the entity from.
   * @returns The entity data.
   */
  public readEntity(_uniqueId: bigint, _dimension: Dimension): EntityEntry {
    throw new Error(`${this.identifier}.readEntity() is not implemented!`);
  }

  /**
   * Writes an entity to the provider.
   * @param entity The entity data to write.
   * @param dimension The dimension to write the entity to.
   */
  public writeEntity(_entity: EntityEntry, _dimension: Dimension): void {
    throw new Error(`${this.identifier}.writeEntity() is not implemented!`);
  }

  /**
   * Reads a players data from the provider.
   * @param uuid The uuid of the player to read.
   * @param dimension The dimension to read the player from.
   * @returns The player data if found, otherwise null.
   */
  public readPlayer(_uuid: string, _dimension: Dimension): PlayerEntry | null {
    throw new Error(`${this.identifier}.readPlayer() is not implemented!`);
  }

  /**
   * Writes a players data to the provider.
   * @param player The player data to write.
   * @param dimension The dimension to write the player to.
   */
  public writePlayer(_player: PlayerEntry, _dimension: Dimension): void {
    throw new Error(`${this.identifier}.writePlayer() is not implemented!`);
  }

  /**
   * Reads the available blocks for a specified dimension.
   * @param dimension The dimension to read the available blocks for.
   */
  public readAvailableBlocks(_dimension: Dimension): Array<bigint> {
    throw new Error(
      `${this.identifier}.readAvailableBlocks() is not implemented!`
    );
  }

  /**
   * Writes the available blocks for a specified dimension.
   * @param dimension The dimension to write the available blocks for.
   * @param blocks The blocks to write.
   */
  public writeAvailableBlocks(
    _dimension: Dimension,
    _blocks: Array<bigint>
  ): void {
    throw new Error(
      `${this.identifier}.writeAvailableBlocks() is not implemented!`
    );
  }

  /**
   * Reads a block from the provider.
   * @param hash The position hash to read the block from.
   * @param dimension The dimension to read the block from.
   */
  public readBlock(_hash: bigint, _dimension: Dimension): BlockEntry {
    throw new Error(`${this.identifier}.readBlock() is not implemented!`);
  }

  /**
   * Writes a block to the provider.
   * @param block The block to write.
   * @param dimension The dimension to write the block to.
   * @returns The block data.
   */
  public writeBlock(_block: BlockEntry, _dimension: Dimension): void {
    throw new Error(`${this.identifier}.writeBlock() is not implemented!`);
  }

  /**
   * Initializes the provider with the specified properties.
   * @param serenity The serenity instance to use.
   * @param properties The properties to use for the provider.
   */
  public static initialize(
    _serenity: Serenity,
    _properties: WorldProviderProperties
  ): void {
    throw new Error(`${this.identifier}.initialize() is not implemented!`);
  }

  public static create(
    _serenity: Serenity,
    _properties: WorldProviderProperties,
    _worldProperties?: Partial<WorldProperties>
  ): World {
    throw new Error(`${this.identifier}.create() is not implemented!`);
  }
}

export { WorldProvider, DefaultWorldProviderProperties };
