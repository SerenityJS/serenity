import { Logger, LoggerColors } from "@serenityjs/logger";

import { Serenity } from "../serenity";
import { DimensionProperties, WorldProperties } from "../types";

import { WorldProvider } from "./provider";
import { DefaultDimensionProperties, Dimension } from "./dimension";

import type { TerrainGenerator } from "./generator";

const DefaultWorldProperties: WorldProperties = {
  identifier: "default"
};

class World {
  public readonly serenity: Serenity;

  public readonly properties: WorldProperties = DefaultWorldProperties;

  public readonly identifier: string;

  public readonly provider: WorldProvider;

  public readonly dimensions = new Map<string, Dimension>();

  public readonly logger: Logger;

  public constructor(
    serenity: Serenity,
    provider: WorldProvider,
    properties?: Partial<WorldProperties>
  ) {
    // Assign the serenity and provider to the world
    this.serenity = serenity;
    this.provider = provider;

    // Assign the properties to the world with the default properties
    this.properties = { ...DefaultWorldProperties, ...properties };

    // Assign the identifier to the world
    this.identifier = this.properties.identifier;

    // Create a new logger for the world
    this.logger = new Logger(this.identifier, LoggerColors.GreenBright);
  }

  public createDimension(
    generator: typeof TerrainGenerator,
    properties?: Partial<DimensionProperties>
  ): Dimension | false {
    // Create the dimension properties
    const dimensionProperties = {
      ...DefaultDimensionProperties,
      ...properties
    };

    // Check if the dimension already exists
    if (this.dimensions.has(dimensionProperties.identifier)) {
      // Log that the dimension already exists
      this.logger.error(
        `Failed to create dimension with identifier ${dimensionProperties.identifier} as it already exists`
      );

      // Return false if the dimension already exists
      return false;
    }

    // Create a new dimension
    const dimension = new Dimension(this, new generator(), dimensionProperties);

    // Register the dimension
    this.dimensions.set(dimension.identifier, dimension);

    // Log that the dimension has been created
    this.logger.debug(`Created dimension: ${dimension.identifier}`);

    // Return the created dimension
    return dimension;
  }

  /**
   * Get the default dimension for the world
   */
  public getDimension(): Dimension;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier: string): Dimension | undefined;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier?: string): Dimension | undefined {
    // Check if the identifier is undefined
    if (identifier === undefined) {
      // Get the first dimension
      return this.dimensions.values().next().value as Dimension;
    }

    // Get the dimension by the identifier
    return this.dimensions.get(identifier);
  }
}

export { World };
