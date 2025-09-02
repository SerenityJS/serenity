import { resolve } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Logger } from "@serenityjs/logger";

import { JsonConfigParser } from "./configParser";

import type { ConfigParser } from "./configParser";

type ConfigPropertyType =
  | BooleanConstructor
  | NumberConstructor
  | StringConstructor;

// Map constructors to primitive types
type ConfigPropertyTypes<T extends ConfigPropertyType> =
  T extends BooleanConstructor
    ? boolean
    : T extends NumberConstructor
    ? number
    : T extends StringConstructor
    ? string
    : never;

interface ConfigProperty<T extends ConfigPropertyType> {
  type: T;
  defaultValue: ConfigPropertyTypes<T>;
  description?: string;
}

// Property descriptor passed to addProperty
interface AddPropertyInput<K extends string, PT extends ConfigPropertyType> {
  name: K;
  type: PT;
  defaultValue: ConfigPropertyTypes<PT>;
  description?: string;
}

/**
 * Represents the configuration for a plugin.
 */
class PluginConfig<T extends Record<string, unknown>> {
  /**
   * The unique identifier for the plugin.
   */
  private pluginIdentifier: string;

  /**
   * A map of configuration properties for the plugin.
   */
  private properties: Map<keyof T, ConfigProperty<ConfigPropertyType>>;

  /**
   * The parser used for reading and writing configuration.
   */
  private parser: typeof ConfigParser;

  /**
   * The folder where the plugin's configuration file is stored.
   */
  private configFolder: string;

  /**
   * The logger instance for the plugin.
   */
  private logger: Logger;

  /**
   * Creates an instance of the PluginConfig class.
   * @param pluginIdentifier The unique identifier for the plugin.
   * @param properties A map of configuration properties for the plugin.
   */
  public constructor(
    pluginIdentifier: string,
    configFolder: string,
    logger: Logger,
    options?: {
      properties?: Map<keyof T, ConfigProperty<ConfigPropertyType>> | unknown;
      parser?: typeof ConfigParser;
    }
  ) {
    this.pluginIdentifier = pluginIdentifier;
    this.configFolder = configFolder;
    // Ensure properties is always a Map
    if (options?.properties instanceof Map) {
      this.properties = options.properties as Map<
        keyof T,
        ConfigProperty<ConfigPropertyType>
      >;
    } else {
      this.properties = new Map();
    }
    this.parser = options?.parser ?? JsonConfigParser;
    this.logger = logger;
  }

  /**
   * Sets the parser used for reading and writing configuration.
   * @param parser The parser to use.
   */
  public setParser(parser: typeof ConfigParser) {
    this.parser = parser;
  }

  /**
   * Adds a new property to the plugin configuration.
   * @param property The property descriptor for the new property.
   * @returns A new instance of PluginConfig with the added property.
   */
  public addProperty<K extends string, PT extends ConfigPropertyType>(
    property: AddPropertyInput<K, PT>
  ): PluginConfig<T & { [P in K]: ConfigPropertyTypes<PT> }> {
    // Shallow copy the existing properties, ensure it's a Map
    const newProperties =
      this.properties instanceof Map
        ? (new Map(this.properties) as Map<
            keyof (T & { [P in K]: ConfigPropertyTypes<PT> }),
            ConfigProperty<ConfigPropertyType>
          >)
        : new Map();

    // Add the new property
    newProperties.set(property.name, {
      type: property.type,
      defaultValue: property.defaultValue,
      description: property.description,
    });

    // Return a new instance of PluginConfig with the updated properties
    return new PluginConfig<T & { [P in K]: ConfigPropertyTypes<PT> }>(
      this.pluginIdentifier,
      this.configFolder,
      this.logger,
      { properties: newProperties, parser: this.parser }
    );
  }

  /**
   * Gets the configuration properties for the plugin.
   * @returns A mapping of property names to their configuration details.
   */
  public getProperties(): {
    [K in keyof T]: {
      type: ConfigPropertyType;
      defaultValue: T[K];
      description?: string;
    };
  } {
    const result = {} as {
      [K in keyof T]: {
        type: ConfigPropertyType;
        defaultValue: T[K];
        description?: string;
      };
    };

    this.properties.forEach((prop, key) => {
      result[key as keyof T] = {
        type: prop.type,
        defaultValue: prop.defaultValue as T[keyof T],
        description: prop.description,
      };
    });

    return result;
  }

  public getDefaultConfig(): T {
    const defaultConfig = {} as T;
    this.properties.forEach((prop, key) => {
      defaultConfig[key as keyof T] = prop.defaultValue as T[keyof T];
    });
    return defaultConfig;
  }

  /**
   * Fetches the plugin's configuration.
   * @returns The plugin's configuration.
   */
  public fetchConfiguration(): T {
    // Ensure the config folder exists
    if (!existsSync(this.configFolder))
      mkdirSync(this.configFolder, { recursive: true });

    // Define the path to the configuration file
    const configFilePath = resolve(
      this.configFolder,
      `${this.pluginIdentifier}.${this.parser.fileExtension}`
    );

    if (!existsSync(configFilePath)) {
      // Get the default configuration
      const defaultConfig = this.getDefaultConfig();

      // Parse the default configuration
      const parsedData = this.parser.write<T>(defaultConfig);

      // Write the parsed configuration to the file
      writeFileSync(configFilePath, parsedData);

      // Return the default configuration
      return defaultConfig;
    } else {
      // Read the configuration file
      const data = readFileSync(configFilePath, "utf-8");

      // Parse the configuration file
      const parsedData = this.parser.read<T>(data);

      // Validate the parsed configuration
      const isValid = this.parser.validate<T>(
        parsedData,
        this.properties,
        this.logger
      );

      return isValid ? parsedData : this.getDefaultConfig();
    }
  }
}

export { PluginConfig, ConfigPropertyType, ConfigProperty, AddPropertyInput };
