import { resolve } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import { Logger, LoggerColors } from "@serenityjs/logger";

import {
  PluginJsonConfigParser,
  type PluginConfigParser
} from "./configParser";

/**
 * Value types supported in plugin configurations.
 */
export type ConfigValueType =
  | BooleanConstructor
  | NumberConstructor
  | StringConstructor;

/**
 * Maps a constructor type to its corresponding primitive type.
 * @template T The constructor type.
 */
export type ConfigValue<T extends ConfigValueType> =
  T extends BooleanConstructor
    ? boolean
    : T extends NumberConstructor
      ? number
      : T extends StringConstructor
        ? string
        : never;

/**
 * Describes a configuration property for a plugin.
 * @template T The constructor type of the property.
 */
export interface ConfigPropertyDescriptor<T extends ConfigValueType> {
  /** The property name. */
  name: string;
  /** The constructor type (Boolean, Number, String). */
  type: T;
  /** The default value for the property. */
  defaultValue: ConfigValue<T>;
  /** The description of the property. */
  description?: string;
}

export interface EnumConfigPropertyDescriptor
  extends ConfigPropertyDescriptor<StringConstructor> {
  /** Allowed values (for enums). */
  allowedValues?: Array<string | number>;
}

export interface NumberConfigPropertyDescriptor
  extends ConfigPropertyDescriptor<NumberConstructor> {
  /** The minimum value (for numbers). */
  min?: number;
  /** The maximum value (for numbers). */
  max?: number;
}

/**
 * A map of property names to their descriptors.
 */
export type ConfigPropertyMap = Record<
  string,
  | ConfigPropertyDescriptor<ConfigValueType>
  | EnumConfigPropertyDescriptor
  | NumberConfigPropertyDescriptor
>;

/**
 * A map of property names to their default values.
 */
export type ConfigDefaultValues = Record<string, string | number | boolean>;

/**
 * Type guard to check if a descriptor is for a number property.
 * @param desc The property descriptor.
 * @returns True if the descriptor is for a number property, false otherwise.
 */
function isNumberDescriptor(
  desc: ConfigPropertyDescriptor<ConfigValueType>
): desc is NumberConfigPropertyDescriptor {
  return desc.type === Number;
}
/**
 * Type guard to check if a descriptor is for an enum property.
 * @param desc The property descriptor.
 * @returns True if the descriptor is for an enum property, false otherwise.
 */
function isEnumDescriptor(
  desc: ConfigPropertyDescriptor<ConfigValueType>
): desc is EnumConfigPropertyDescriptor {
  return desc.type === String && "allowedValues" in desc;
}

/**
 * PluginConfigSystem manages plugin configuration schema, validation, and persistence.
 */
export class PluginConfigSystem {
  /** The unique identifier for the plugin. */
  private pluginIdentifier: string;
  /** Map of property names to their descriptors. */
  private propertyDescriptors: ConfigPropertyMap = {};
  /** The parser used for reading and writing configuration. */
  private parser: typeof PluginConfigParser;
  /** The folder where the plugin's configuration file is stored. */
  private configFolder: string;
  /** The logger instance for the plugin. */
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
    logger: Logger
  ) {
    this.pluginIdentifier = pluginIdentifier;
    this.configFolder = configFolder;
    this.logger = logger;
    this.parser = PluginJsonConfigParser;
  }

  /**
   * Sets the parser used for reading and writing configuration.
   * @param parser The parser to use.
   */
  public setParser(parser: typeof PluginConfigParser) {
    this.parser = parser;
  }

  /**
   * Adds a string property to the plugin configuration.
   * @param name The property name.
   * @param defaultValue The default string value.
   * @param description The property description.
   * @returns The PluginConfigSystem instance (for chaining).
   */
  public addString(
    name: string,
    defaultValue: string,
    description: string
  ): this {
    this.propertyDescriptors[name] = {
      name,
      type: String,
      defaultValue,
      description
    };
    return this;
  }

  /**
   * Adds a boolean property to the plugin configuration.
   * @param name The property name.
   * @param defaultValue The default boolean value.
   * @param description The property description.
   * @returns The PluginConfigSystem instance (for chaining).
   */
  public addBoolean(
    name: string,
    defaultValue: boolean,
    description: string
  ): this {
    this.propertyDescriptors[name] = {
      name,
      type: Boolean,
      defaultValue,
      description
    };
    return this;
  }

  /**
   * Adds a number property to the plugin configuration.
   * @param name The property name.
   * @param defaultValue The default number value.
   * @param description The property description.
   * @param min The minimum allowed value (optional).
   * @param max The maximum allowed value (optional).
   * @returns The PluginConfigSystem instance (for chaining).
   */
  public addNumber(
    name: string,
    defaultValue: number,
    description: string,
    min?: number,
    max?: number
  ): this {
    this.propertyDescriptors[name] = {
      name,
      type: Number,
      defaultValue,
      description,
      min,
      max
    };
    return this;
  }

  /**
   * Adds an enum property to the plugin configuration.
   * @param name The property name.
   * @param allowedValues The allowed enum values.
   * @param defaultValue The default value.
   * @param description The property description.
   * @returns The PluginConfigSystem instance (for chaining).
   */
  public addEnum<T extends string | number>(
    name: string,
    allowedValues: Array<T>,
    defaultValue: T,
    description: string
  ): this {
    this.propertyDescriptors[name] = {
      name,
      type: typeof defaultValue === "number" ? Number : String,
      defaultValue,
      description,
      allowedValues
    };
    return this;
  }

  /**
   * Returns the default configuration values for the plugin.
   * @returns A mapping of property names to their default values.
   */
  public getDefaultConfig<T extends ConfigDefaultValues>(): T {
    const out: ConfigDefaultValues = {};
    for (const [k, d] of Object.entries(this.propertyDescriptors))
      out[k] = d.defaultValue;

    return out as T;
  }

  /**
   * Loads, validates, and fixes the plugin configuration from disk.
   * If any value is missing or invalid, it is replaced with the default and the file is updated.
   * @returns The validated and possibly fixed configuration object.
   */
  public fetchConfiguration<T extends ConfigDefaultValues>(): T {
    // Create config folder if missing
    if (!existsSync(this.configFolder))
      mkdirSync(this.configFolder, { recursive: true });

    const filePath = resolve(
      this.configFolder,
      `${this.pluginIdentifier}.${this.parser.fileExtension}`
    );

    // Get default config
    const defaults = this.getDefaultConfig();

    // Create config file if missing
    if (!existsSync(filePath)) {
      writeFileSync(filePath, this.parser.serialize(defaults));
      return defaults as T;
    }

    // Read existing config
    const data = this.parser.deserialize<ConfigDefaultValues>(
      readFileSync(filePath, "utf8")
    );

    let mutated = false;

    for (const [key, desc] of Object.entries(this.propertyDescriptors)) {
      // Read value
      let value = data[key];

      // Missing -> default
      if (value === undefined) {
        data[key] = desc.defaultValue;
        mutated = true;
        continue;
      }

      // Type coercion for numbers
      if (desc.type === Number && typeof value !== "number") {
        const n = Number(value);
        if (!Number.isNaN(n)) {
          data[key] = n;
          value = n;
          mutated = true;
        }
      }

      // Type coercion for booleans
      if (desc.type === Boolean && typeof value !== "boolean")
        if (value === "true" || value === "false") {
          data[key] = value === "true";
          value = data[key];
          mutated = true;
        }

      // Hard type check
      if (typeof value !== typeof desc.defaultValue) {
        this.logger.error(`Config '${key}' invalid type, resetting to default`);
        data[key] = desc.defaultValue;
        mutated = true;
        continue;
      }

      // Number bounds
      if (typeof value === "number" && isNumberDescriptor(desc)) {
        if (desc.min !== undefined && value < desc.min) {
          data[key] = desc.min;
          mutated = true;
        }
        if (desc.max !== undefined && value > desc.max) {
          data[key] = desc.max;
          mutated = true;
        }
      }

      // Enum check
      if (
        typeof value == "string" &&
        isEnumDescriptor(desc) &&
        !desc.allowedValues?.includes(value)
      ) {
        this.logger.error(
          `Config '${key}' invalid enum value '${value}', resetting`
        );
        data[key] = desc.defaultValue;
        mutated = true;
      }
    }

    // Rewrite if fixed
    if (mutated) writeFileSync(filePath, this.parser.serialize(data));

    return data as T;
  }
}

const test = new PluginConfigSystem(
  "my-plugin",
  "./config",
  new Logger("MyPlugin", LoggerColors.Aqua)
);

test
  .addString(
    "welcomeMessage",
    "Hello, World!",
    "The welcome message for users."
  )
  .addBoolean("enableFeatureX", true, "Enable or disable Feature X.")
  .addNumber("maxConnections", 10, "Maximum number of connections allowed.")
  .addEnum(
    "logLevel",
    ["debug", "info", "warn", "error"],
    "info",
    "The logging level for the plugin."
  );

interface MyPluginConfig extends ConfigDefaultValues {
  welcomeMessage: string;
  enableFeatureX: boolean;
  maxConnections: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

const config = test.fetchConfiguration<MyPluginConfig>();
console.log(config.enableFeatureX);
