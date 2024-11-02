import { Serenity } from "@serenityjs/core";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { Pipeline } from "./pipeline";

interface PluginProperties {
  logger: Logger;
  onInitialize: (serenity: Serenity, plugin: Plugin) => void;
  onStartUp: (serenity: Serenity, plugin: Plugin) => void;
  onShutDown: (serenity: Serenity, plugin: Plugin) => void;
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
   * The plugin pipeline the plugin is in.
   */
  public pipeline!: Pipeline;

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
   * @param serenity The serenity server instance of the server.
   * @param plugin The plugin instance that was initialized. (this)
   */
  public onInitialize(_serenity: Serenity, _plugin: this): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is started up.
   * @param serenity The serenity server instance of the server.
   * @param plugin The plugin instance that was started up. (this)
   */
  public onStartUp(_serenity: Serenity, _plugin: this): void {
    // Override this method in your plugin
  }

  /**
   * Called when the plugin is shut down.
   * @param serenity The serenity server instance of the server.
   * @param plugin The plugin instance that was shut down. (this)
   */
  public onShutDown(_serenity: Serenity, _plugin: this): void {
    // Override this method in your plugin
  }
}

export { Plugin, PluginProperties };
