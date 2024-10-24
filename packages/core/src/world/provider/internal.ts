import { ChunkCoords } from "@serenityjs/protocol";

import { Serenity } from "../../serenity";
import {
  EntityEntry,
  PlayerEntry,
  WorldProperties,
  WorldProviderProperties
} from "../../types";
import { Chunk } from "../chunk";
import { World } from "../world";
import { Dimension } from "../dimension";

import { WorldProvider } from "./provider";

class InternalProvider extends WorldProvider {
  public static readonly identifier = "internal";

  /**
   * The loaded chunks in the provider.
   */
  public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

  /**
   * The entities that exist for the world.
   */
  public readonly entities = new Map<Dimension, Map<bigint, EntityEntry>>();

  /**
   * The players that exist for the world.
   */
  public readonly players = new Map<Dimension, Map<string, PlayerEntry>>();

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

  public getAvailableEntities(dimension: Dimension): Array<bigint> {
    // Check if the entities contain the dimension.
    if (!this.entities.has(dimension)) {
      this.entities.set(dimension, new Map());
    }

    // Get the dimension entities.
    const entities = this.entities.get(dimension) as Map<bigint, EntityEntry>;

    // Return the entity unique ids.
    return [...entities].map(([uniqueId]) => uniqueId);
  }

  public readEntity(uniqueId: bigint, dimension: Dimension): EntityEntry {
    // Check if the entities contain the dimension.
    if (!this.entities.has(dimension)) {
      this.entities.set(dimension, new Map());
    }

    // Get the dimension entities.
    const entities = this.entities.get(dimension) as Map<bigint, EntityEntry>;

    // Check if the entities contain the unique id.
    if (!entities.has(uniqueId)) {
      throw new Error(`Entity with unique id ${uniqueId} not found!`);
    }

    // Return the entity.
    return entities.get(uniqueId) as EntityEntry;
  }

  public writeEntity(entity: EntityEntry, dimension: Dimension): void {
    // Check if the entities contain the dimension.
    if (!this.entities.has(dimension)) {
      this.entities.set(dimension, new Map());
    }

    // Get the dimension entities.
    const entities = this.entities.get(dimension) as Map<bigint, EntityEntry>;

    // Set the entity.
    entities.set(entity.uniqueId, entity);
  }

  public readPlayer(uuid: string, dimension: Dimension): PlayerEntry | null {
    // Check if the players contain the dimension.
    if (!this.players.has(dimension)) {
      this.players.set(dimension, new Map());
    }

    // Get the dimension players.
    const players = this.players.get(dimension) as Map<string, PlayerEntry>;

    // Check if the players contain the uuid.
    if (!players.has(uuid)) {
      return null;
    }

    // Return the player.
    return players.get(uuid) as PlayerEntry;
  }

  public writePlayer(player: PlayerEntry, dimension: Dimension): void {
    // Check if the players contain the dimension.
    if (!this.players.has(dimension)) {
      this.players.set(dimension, new Map());
    }

    // Get the dimension players.
    const players = this.players.get(dimension) as Map<string, PlayerEntry>;

    // Set the player.
    players.set(player.uuid, player);
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

    // Assign the world to the provider
    provider.world = world;

    // Return the created world
    return world;
  }
}

export { InternalProvider };
