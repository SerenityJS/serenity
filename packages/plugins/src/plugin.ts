import { Serenity } from "@serenityjs/core";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { Pipeline } from "./pipeline";

interface PluginProperties {
  logger: Logger;
  onInitialize: (plugin: Plugin) => void;
  onStartUp: (plugin: Plugin) => void;
  onShutDown: (plugin: Plugin) => void;
}

class Plugin {
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
      properties?.logger ||
      new Logger(`${identifier}@${version}`, LoggerColors.Blue);

    // Set the on initialize, start up, and shut down properties
    if (properties?.onInitialize) this.onInitialize = properties.onInitialize;
    if (properties?.onStartUp) this.onStartUp = properties.onStartUp;
    if (properties?.onShutDown) this.onShutDown = properties.onShutDown;
  }

  /**
   * Called when the plugin is initialized.
   * @param plugin The plugin instance that was initialized. (this)
   */
  public onInitialize(_plugin: this): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is started up.
   * @param plugin The plugin instance that was started up. (this)
   */
  public onStartUp(_plugin: this): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is shut down.
   * @param plugin The plugin instance that was shut down. (this)
   */
  public onShutDown(_plugin: this): void {
    // Override this method in your plugin
  }
}

export { Plugin, PluginProperties };
