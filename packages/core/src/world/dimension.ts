import { DimensionType } from "@serenityjs/protocol";

import { World } from "./world";
import { TerrainGenerator } from "./generator";

interface DimensionProperties {
  identifier: string;
  type: DimensionType;
}

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
}

export { Dimension };
