import { Logger } from "@serenityjs/logger";

import { ConfigProperty, ConfigPropertyType } from "./pluginConfig";

class ConfigParser {
  /**
   * The file extension used for configuration file.
   */
  public static fileExtension: string = "";

  public static validate<T extends Record<string, unknown>>(
    obj: T,
    properties: Map<keyof T, ConfigProperty<ConfigPropertyType>>,
    logger?: Logger
  ): boolean {
    let isValid = true;
    properties.forEach((prop, key) => {
      const value = obj[key];
      if (value == undefined) {
        logger?.error(
          `Failed to Validate Config: Missing required property: ${String(key)}`
        );
        isValid = false;
      } else if (typeof value !== prop.type.name.toLowerCase()) {
        logger?.error(
          `Failed to Validate Config: Invalid type for property ${String(
            key
          )}: expected ${prop.type.name.toLowerCase()}, got ${typeof value}`
        );
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Reads a plugin configuration from a string.
   * @param _ The string form of the config file.
   */
  public static read<T extends Record<string, unknown>>(_: string): T {
    // Overwrite with actual parsing logic
    return {} as T;
  }
  /**
   * Serializes a plugin configuration to a string.
   * @param _ The configuration object to serialize.
   * @return The serialized configuration string.
   */
  public static write<T extends Record<string, unknown>>(_: T): string {
    // Overwrite with actual serialization logic
    return "";
  }
}

class JsonConfigParser extends ConfigParser {
  public static fileExtension: string = "json";

  public static read<T extends Record<string, unknown>>(string: string): T {
    return JSON.parse(string) as T;
  }

  public static write<T extends Record<string, unknown>>(object: T): string {
    return JSON.stringify(object, null, 2) as string;
  }
}

export { ConfigParser, JsonConfigParser };
