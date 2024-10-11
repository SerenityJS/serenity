import { ChunkCoords } from "@serenityjs/protocol";

import { Serenity } from "../../serenity";
import {
  PlayerProperties,
  WorldProperties,
  WorldProviderProperties
} from "../../types";
import { Chunk } from "../chunk";
import { World } from "../world";
import { Dimension } from "../dimension";
import { Player } from "../../entity";

import { WorldProvider } from "./provider";

class InternalProvider extends WorldProvider {
  public static readonly identifier = "internal";

  /**
   * The loaded chunks in the provider.
   */
  public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

  /**
   * The player properties in the provider.
   */
  public readonly players = new Map<string, PlayerProperties>();

  public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
    // Check if the chunks contain the dimension.
    if (!this.chunks.has(dimension)) {
      this.chunks.set(dimension, new Map());
    }

    // Get the dimension chunks.
    const chunks = this.chunks.get(dimension) as Map<bigint, Chunk>;

    // Check if the chunks contain the chunk hash.
    if (!chunks.has(ChunkCoords.hash({ x: cx, z: cz }))) {
      chunks.set(
        ChunkCoords.hash({ x: cx, z: cz }),
        dimension.generator.apply(cx, cz, dimension.type)
      );
    }

    // Return the chunk.
    return chunks.get(ChunkCoords.hash({ x: cx, z: cz })) as Chunk;
  }

  public writeChunk(chunk: Chunk, dimension: Dimension): void {
    // Check if the chunks contain the dimension.
    if (!this.chunks.has(dimension)) {
      this.chunks.set(dimension, new Map());
    }

    // Get the dimension chunks.
    const chunks = this.chunks.get(dimension) as Map<bigint, Chunk>;

    // Set the chunk.
    chunks.set(ChunkCoords.hash({ x: chunk.x, z: chunk.z }), chunk);
  }

  public readPlayer(player: string | Player): PlayerProperties | null {
    // Get the uuid of the player.
    const uuid = typeof player === "string" ? player : player.uuid;

    // Check if the players contain the player.
    if (!this.players.has(uuid)) {
      return null;
    }

    // Return the player properties.
    return this.players.get(uuid) as PlayerProperties;
  }

  public writePlayer(
    player: string | Player,
    properties: PlayerProperties
  ): void {
    // Get uuid of the player.
    const uuid = typeof player === "string" ? player : player.uuid;

    // Set the player properties.
    this.players.set(uuid, properties);
  }

  public static initialize(): void {
    // Do nothing as the internal provider does not require initialization
    return;
  }

  public static create(
    serenity: Serenity,
    _properties: WorldProviderProperties,
    worldProperties?: WorldProperties
  ): World {
    // Create a new provider instance
    const provider = new this();

    // Create a new world instance
    const world = new World(serenity, provider, worldProperties);

    // Return the created world
    return world;
  }
}

export { InternalProvider };
