import { DimensionType } from "@serenityjs/protocol";

import { DimensionProperties } from "../types";

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

  public getChunk(cx: number, cz: number): Chunk {
    // Read the chunk from the provider
    const chunk = this.world.provider.readChunk(cx, cz, this);

    // Return the chunk
    return chunk;
  }
}

export { Dimension, DefaultDimensionProperties };
