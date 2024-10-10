import { Logger, LoggerColors } from "@serenityjs/logger";

import { Serenity } from "../serenity";

import { WorldProvider } from "./provider";

interface WorldProperties {
  identifier: string;
  provider: WorldProvider;
}

const DefaultWorldProperties: WorldProperties = {
  identifier: "default",
  provider: new WorldProvider()
};

class World {
  public readonly serenity: Serenity;

  public readonly properties: WorldProperties = DefaultWorldProperties;

  public readonly identifier: string;

  public readonly provider: WorldProvider;

  public readonly dimensions = new Map<string, unknown>();

  public readonly logger: Logger;

  public constructor(
    serenity: Serenity,
    properties?: Partial<WorldProperties>
  ) {
    // Assign the serenity instance
    this.serenity = serenity;

    // Assign the properties to the world with the default properties
    this.properties = { ...DefaultWorldProperties, ...properties };

    // Assign the identifier and provider
    this.identifier = this.properties.identifier;
    this.provider = this.properties.provider;

    // Create a new logger for the world
    this.logger = new Logger(this.identifier, LoggerColors.GreenBright);
  }
}

export { World };
