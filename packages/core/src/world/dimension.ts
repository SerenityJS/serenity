import { DataPacket, DimensionType } from "@serenityjs/protocol";

import { DimensionProperties } from "../types";
import { Entity, Player } from "../entity";

import { World } from "./world";
import { TerrainGenerator } from "./generator";
import { Chunk } from "./chunk";

const DefaultDimensionProperties: DimensionProperties = {
  identifier: "overworld",
  type: DimensionType.Overworld
};

class Dimension {
  public readonly properties: DimensionProperties = DefaultDimensionProperties;

  public readonly identifier: string;

  public readonly type: DimensionType;

  public readonly world: World;

  public readonly generator: TerrainGenerator;

  public readonly entities = new Map<bigint, Entity>();

  public viewDistance: number = 16;

  public simulationDistance: number = 8;

  public constructor(
    world: World,
    generator: TerrainGenerator,
    properties?: DimensionProperties
  ) {
    // Assign the world and generator
    this.world = world;
    this.generator = generator;

    // Assign the properties to the dimension with the default properties
    this.properties = { ...DefaultDimensionProperties, ...properties };

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
   * Gets all the players in the dimension.
   * @returns An array of players.
   */
  public getPlayers(): Array<Player> {
    return [...this.entities.values()].filter((entity) => entity.isPlayer());
  }

  /**
   * Gets all the entities in the dimension.
   * @returns An array of entities.
   */
  public getEntities(): Array<Entity> {
    return [...this.entities.values()];
  }

  /**
   * Broadcast packets to all the players in the dimension.
   * @param packets The packets to broadcast.
   */
  public broadcast(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.send(...packets);
  }
}

export { Dimension, DefaultDimensionProperties };
