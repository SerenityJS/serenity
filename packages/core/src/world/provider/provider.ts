import { Player } from "../../entity";
import { Serenity } from "../../serenity";
import {
  PlayerProperties,
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
   * Reads a player from the provider.
   * @param player The player to read.
   */
  public readPlayer(_player: string | Player): PlayerProperties | null {
    throw new Error(`${this.identifier}.readPlayer() is not implemented!`);
  }

  /**
   * Writes a player to the provider.
   * @param player The player to write.
   * @param properties The properties to write.
   */
  public writePlayer(
    _player: string | Player,
    _properties: PlayerProperties
  ): void {
    throw new Error(`${this.identifier}.writePlayer() is not implemented!`);
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
    _worldProperties?: WorldProperties
  ): World {
    throw new Error(`${this.identifier}.create() is not implemented!`);
  }
}

export { WorldProvider, DefaultWorldProviderProperties };
