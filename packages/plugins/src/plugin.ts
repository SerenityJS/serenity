import { Serenity } from "@serenityjs/core";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { Pipeline } from "./pipeline";
import { PluginType } from "./enums";
import { PluginEvents } from "./types";

interface PluginProperties extends Partial<PluginEvents> {
  logger: Logger;
  type: PluginType;
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
class Plugin implements PluginProperties {
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
   * The type of the plugin.
   */
  public readonly type: PluginType;

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
   * @param properties The properties of the plugin.
   */
  public constructor(
    identifier: string,
    version: string,
    properties?: Partial<PluginProperties>
  ) {
    // Set the identifier and version of the plugin
    this.identifier = identifier;
    this.version = version;

    // Set the logger for the plugin
    this.logger =
      properties?.logger ??
      new Logger(`${identifier}@${version}`, LoggerColors.Blue);

    // Set the type of the plugin
    this.type = properties?.type ?? PluginType.Addon;

    // Set the on initialize, start up, and shut down properties
    if (properties?.onInitialize) this.onInitialize = properties.onInitialize;
    if (properties?.onStartUp) this.onStartUp = properties.onStartUp;
    if (properties?.onShutDown) this.onShutDown = properties.onShutDown;
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
}

export { Plugin, PluginProperties };
