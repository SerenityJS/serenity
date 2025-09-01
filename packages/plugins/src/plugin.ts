import { resolve, sep } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { ResourcePack, Serenity } from "@serenityjs/core";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { Emitter } from "@serenityjs/emitter";

import { Pipeline } from "./pipeline";
import { PluginEvents } from "./types";
import {
  PluginBlockRegistry,
  PluginEntityRegistry,
  PluginItemRegistry
} from "./registry";
import { PluginPriority } from "./enums/priority";

interface PluginOptions extends Partial<PluginEvents> {
  /**
   * The logger instance for the plugin.
   */
  logger: Logger;

  /**
   * The type of the plugin.
   */
  priority: PluginPriority;

  /**
   * The maximum number of listeners for the plugin.
   */
  maxListeners: number;
}

/**
 * # Introduction
 * Plugins are the fundamental building blocks of SerenityJS.
 * They are used to add additional functionality to the server, which allows total control over the server.
 *
 * There are 2 types of plugins that are defined in the `PluginType` enum: `Addon` & `Api`
 *
 * Addon plugins add additional functionality to the server, without an exposed API. This means external plugins cannot directly interact with the plugins API.
 * Api plugins add additional functionality to the server, with an exposed API for other plugins to use. This means external plugins can directly interact with the plugins API.
 *
 * ## Class Extending Plugin
 * ```ts
 * import { Plugin, PluginType, PluginEvents } from "@serenityjs/plugins";
 *
 * class SamplePlugin extends Plugin {
 *   public readonly type = PluginType.Addon;
 *
 *   public constructor() {
 *     super("sample-plugin", "1.0.0");
 *   }
 *
 *   public onInitialize(): void {}
 *
 *   public onStartUp(): void {}
 *
 *   public onShutDown(): void {}
 * }
 *
 * export default new SamplePlugin();
 * ```
 */
class Plugin<T = unknown> extends Emitter<T> implements PluginOptions {
  /**
   * The identifier of the plugin.
   */
  public readonly identifier: string;

  /**
   * The version of the plugin.
   */
  public readonly version: string;

  /**
   * The logger for the plugin.
   */
  public readonly logger: Logger;

  /**
   * The priority of the plugin.
   * @note This is used to determine the order in which plugins are loaded.
   */
  public readonly priority: PluginPriority = PluginPriority.Normal;

  /**
   * The block registry for the plugin.
   * @note Only register types/traits during the `onInitialize` event.
   */
  public readonly blocks = new PluginBlockRegistry();

  /**
   * The item registry for the plugin.
   * @note Only register types/traits during the `onInitialize` event.
   */
  public readonly items = new PluginItemRegistry();

  /**
   * The entity registry for the plugin.
   * @note Only register types/traits during the `onInitialize` event.
   */
  public readonly entities = new PluginEntityRegistry();

  /**
   * The resource packs provided by the plugin.
   */
  public readonly resources = new Set<ResourcePack>();

  /**
   * The config of the plugin.
   */
  public readonly config: unknown = {};

  /**
   * The path to the plugin.
   * @Note This is only available after the plugin is initialized.
   */
  public path!: string;

  /**
   * Whether or not the plugin is bundled.
   * @Note This is only available after the plugin is initialized.
   */
  public isBundled!: boolean;

  /**
   * The plugin pipeline the plugin is in.
   * @Note This is only available after the plugin is initialized.
   */
  public pipeline!: Pipeline;

  /**
   * The serenity instance of the server.
   * @Note This is only available after the plugin is initialized.
   */
  public serenity!: Serenity;

  /**
   * Create a new plugin instance.
   * @param identifier The identifier of the plugin.
   * @param version The version of the plugin.
   * @param options The options of the plugin.
   */
  public constructor(
    identifier: string,
    version: string,
    options?: Partial<PluginOptions>
  ) {
    // Call the super method with the max listeners
    super(options?.maxListeners);

    // Set the identifier and version of the plugin
    this.identifier = identifier;
    this.version = version;

    // Set the logger for the plugin
    this.logger =
      options?.logger ??
      new Logger(`${identifier}@${version}`, LoggerColors.Blue);

    // Set the on initialize, start up, and shut down options
    if (options?.onInitialize) this.onInitialize = options.onInitialize;
    if (options?.onStartUp) this.onStartUp = options.onStartUp;
    if (options?.onShutDown) this.onShutDown = options.onShutDown;
  }

  /**
   * Resolve a plugin by its identifier
   * @param identifier The identifier of the plugin to resolve.
   * @returns The plugin instance if found, otherwise null.
   */
  public resolve<T extends Plugin>(identifier: string): T | null {
    // Check if the pipeline is defined.
    if (!this.pipeline) return null;

    // Get the plugin from the pipeline
    const plugin = this.pipeline.plugins.get(identifier);

    // Check if the plugin is defined
    if (!plugin) return null;

    // Return the plugin
    return plugin as T;
  }

  /**
   * Called when the plugin is initialized.
   * @param plugin The plugin instance that was initialized. (this)
   */
  public onInitialize(_plugin: Plugin): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is started up.
   * @param plugin The plugin instance that was started up. (this)
   */
  public onStartUp(_plugin: Plugin): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is shut down.
   * @param plugin The plugin instance that was shut down. (this)
   */
  public onShutDown(_plugin: Plugin): void {
    // Override this method in your plugin
  }

  /**
   * Check if a file exists in the plugin data directory.
   * @param path The path to the file to check.
   * @returns True if the file exists, otherwise false.
   */
  public hasFile(path: string): boolean {
    // Check if the pipeline is defined.
    if (!this.pipeline) return false;

    // Resolve the path to the plugin data directory
    const dataPath = resolve(this.pipeline.path, "data", this.identifier);

    // Check if the plugin data path exists
    if (!existsSync(dataPath)) return false;

    // Resolve the full path to the file
    const fullPath = resolve(dataPath, path);

    // Ensure the resolved path is still inside dataPath (prevents "../" escapes)
    if (!fullPath.startsWith(dataPath + sep)) {
      // Log a warning if an illegal path attempt is made
      this.logger.warn(
        `Attempted to check for an illegal path: ${path}. Operation aborted.`
      );

      return false; // Illegal path attempt
    }

    // Check if the file exists
    return existsSync(fullPath);
  }

  /**
   * Read a file from the plugin data directory.
   * @param path The path to the file to read.
   * @returns The file data if it exists, otherwise null.
   */
  public readFile(path: string): Buffer | null {
    if (!this.pipeline) return null;

    // Base plugin data directory
    const dataPath = resolve(this.pipeline.path, "data", this.identifier);
    if (!existsSync(dataPath)) return null;

    // Resolve the requested file path
    const fullPath = resolve(dataPath, path);

    // Ensure the resolved path is still inside dataPath (prevents "../" escapes)
    if (!fullPath.startsWith(dataPath + sep)) {
      // Log a warning if an illegal path attempt is made
      this.logger.warn(
        `Attempted to read from an illegal path: ${path}. Operation aborted.`
      );

      return null; // Illegal path attempt
    }

    // Check if file exists
    if (!existsSync(fullPath)) return null;

    // Read and return the file data
    return Buffer.from(readFileSync(fullPath));
  }

  /**
   * Write a file to the plugin data directory.
   * @param path The path to the file to write.
   * @param data The file data to write.
   */
  public writeFile(path: string, data: Buffer | string): void {
    // Check if the pipeline is defined.
    if (!this.pipeline) return;

    // Resolve the path to the plugin data directory
    const dataPath = resolve(this.pipeline.path, "data", this.identifier);

    // Check if the plugin data path exists
    if (!existsSync(dataPath))
      // If it doesn't, make the directory
      mkdirSync(dataPath, { recursive: true });

    // Resolve the full path to the file
    const fullPath = resolve(dataPath, path);

    // Ensure the resolved path is still inside dataPath (prevents "../" escapes)
    if (!fullPath.startsWith(dataPath + sep)) {
      // Log a warning if an illegal path attempt is made
      this.logger.warn(
        `Attempted to write to an illegal path: ${path}. Operation aborted.`
      );

      return; // Illegal path attempt
    }

    // Write the file data
    return writeFileSync(fullPath, data);
  }

  /**
   * Define the config for the plugin.
   * @param definition The config definition.
   * @returns The config object.
   */
  public defineConfig<T>(definition: T): T {
    // Assign the values to the config object
    Object.assign(this.config as object, definition);

    // Return the config object
    return this.config as T;
  }
}

export { Plugin, PluginOptions };
