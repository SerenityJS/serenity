import { resolve } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import { Logger } from "@serenityjs/logger";

import { PluginJsonConfigParser } from "./configParser";

import type { PluginConfigParser } from "./configParser";

type ConfigValueType =
  | BooleanConstructor
  | NumberConstructor
  | StringConstructor;

// Map constructors to primitive types
type ConfigValue<T extends ConfigValueType> = T extends BooleanConstructor
  ? boolean
  : T extends NumberConstructor
  ? number
  : T extends StringConstructor
  ? string
  : never;

interface ConfigPropertyDescriptor<T extends ConfigValueType> {
  name: string;
  type: T;
  defaultValue: ConfigValue<T>;
  description?: string;
}

type ConfigPropertyMap = Record<
  string,
  ConfigPropertyDescriptor<ConfigValueType>
>;

type ConfigDefaultValues = Record<
  string,
  ConfigPropertyDescriptor<ConfigValueType>["defaultValue"]
>;

/**
 * Represents the configuration for a plugin.
 */
class PluginConfigSystem {
  /**
   * The unique identifier for the plugin.
   */
  private pluginIdentifier: string;

  /**
   * A map of configuration properties for the plugin.
   */
  private propertyDescriptors: ConfigPropertyMap = {};

  /**
   * The parser used for reading and writing configuration.
   */
  private parser: typeof PluginConfigParser;

  /**
   * The folder where the plugin's configuration file is stored.
   */
  private configFolder: string;

  /**
   * The logger instance for the plugin.
   */
  private logger: Logger;

  /**
   * Creates an instance of the PluginConfigSystem class.
   * @param pluginIdentifier The unique identifier for the plugin.
   * @param configFolder The folder where the configuration file is stored.
   * @param logger The logger instance for the plugin.
   * @param options Optional configuration options.
   */
  public constructor(
    pluginIdentifier: string,
    configFolder: string,
    logger: Logger,
    options?: {
      propertyDescriptors?: ConfigPropertyMap;
      parser?: typeof PluginConfigParser;
    }
  ) {
    this.pluginIdentifier = pluginIdentifier;
    this.configFolder = configFolder;

    // Initialize property descriptors map
    if (options?.propertyDescriptors) {
      for (const [key, value] of Object.entries(options.propertyDescriptors)) {
        this.propertyDescriptors[key] =
          value as ConfigPropertyDescriptor<ConfigValueType>;
      }
    }

    this.parser = options?.parser ?? PluginJsonConfigParser;
    this.logger = logger;
  }

  /**
   * Sets the parser used for reading and writing configuration.
   * @param parser The parser to use.
   */
  public setParser(parser: typeof PluginConfigParser) {
    this.parser = parser;
  }

  /**
   * Adds a new property to the plugin configuration.
   * @param property The property descriptor for the new property.
   * @returns A new instance of PluginConfigSystem with the added property.
   */
  public addProperty<PT extends ConfigValueType>(property: {
    name: string;
    type: PT;
    defaultValue: ConfigValue<PT>;
    description?: string;
  }): PluginConfigSystem {
    // Add the new property
    this.propertyDescriptors[property.name] = {
      name: property.name,
      type: property.type,
      defaultValue: property.defaultValue,
      description: property.description,
    };

    // Return the updated instance
    return this;
  }

  /**
   * Gets the configuration properties for the plugin.
   * @returns A mapping of property names to their configuration details.
   */
  public getProperties() {
    const result: ConfigPropertyMap = {};

    for (const [key, prop] of Object.entries(this.propertyDescriptors))
      result[key] = {
        name: prop.name,
        type: prop.type,
        defaultValue: prop.defaultValue,
        description: prop.description,
      };

    return result;
  }

  /**
   * Gets the default configuration values for the plugin.
   * @returns A mapping of property names to their default values.
   */
  public getDefaultConfig<T extends ConfigDefaultValues>(): T {
    const defaultConfig: ConfigDefaultValues = {};
    for (const [key, prop] of Object.entries(this.propertyDescriptors)) {
      defaultConfig[key] = prop.defaultValue;
    }
    return defaultConfig as T;
  }

  /**
   * Fetches the plugin's configuration.
   * @returns The plugin's configuration.
   */
  public fetchConfiguration<T extends ConfigDefaultValues>(): T {
    // Ensure the config folder exists
    if (!existsSync(this.configFolder)) {
      mkdirSync(this.configFolder, { recursive: true });
    }

    // Define the path to the configuration file
    const configFilePath = resolve(
      this.configFolder,
      `${this.pluginIdentifier}.${this.parser.fileExtension}`
    );

    if (!existsSync(configFilePath)) {
      // Get the default configuration
      const defaultConfig = this.getDefaultConfig();

      // Parse the default configuration
      const parsedData = this.parser.write<ConfigDefaultValues>(defaultConfig);

      // Write the parsed configuration to the file
      writeFileSync(configFilePath, parsedData);

      // Return the default configuration
      return defaultConfig as T;
    } else {
      // Read the configuration file
      const data = readFileSync(configFilePath, "utf-8");

      // Parse the configuration file
      const parsedData = this.parser.read<ConfigDefaultValues>(data);

      // Validate the parsed configuration
      const isValid = this.parser.validate<ConfigDefaultValues>(
        parsedData,
        this.propertyDescriptors,
        this.logger
      );

      return isValid ? (parsedData as T) : this.getDefaultConfig();
    }
  }
}

export {
  PluginConfigSystem,
  ConfigValueType,
  ConfigDefaultValues,
  ConfigPropertyDescriptor,
  ConfigPropertyMap,
};
