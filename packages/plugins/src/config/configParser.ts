import { Logger } from "@serenityjs/logger";

import { ConfigPropertyMap } from "./pluginConfig";

/**
 * Base class for plugin configuration parsers.
 */
class PluginConfigParser {
  /**
   * The file extension used for configuration file.
   */
  public static fileExtension: string = "";

  public static validate<T extends Record<string, unknown>>(
    obj: T,
    properties: ConfigPropertyMap,
    logger?: Logger
  ): boolean {
    // Boolean flag to track validation status
    let isValid = true;

    Object.entries(properties).forEach(([key, prop]) => {
      // Get the value of the property from the object
      const value = obj[key];

      // Check if the value is missing
      if (value == undefined) {
        logger?.error(
          `Failed to Validate Config: Missing required property: ${String(key)}`
        );
        isValid = false;
      }
      // Check if the value is of the expected type
      else if (typeof value !== prop.type.name.toLowerCase()) {
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

/**
 * JSON configuration parser for plugins.
 */
class PluginJsonConfigParser extends PluginConfigParser {
  public static fileExtension: string = "json";

  public static read<T extends Record<string, unknown>>(string: string): T {
    return JSON.parse(string) as T;
  }

  public static write<T extends Record<string, unknown>>(object: T): string {
    return JSON.stringify(object, null, 2) as string;
  }
}

export { PluginConfigParser, PluginJsonConfigParser };
