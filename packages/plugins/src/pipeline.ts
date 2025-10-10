/* eslint-disable @typescript-eslint/no-require-imports */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { relative, resolve } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { Serenity, ServerEvent, WorldEvent } from "@serenityjs/core";
import { BinaryStream } from "@serenityjs/binarystream";

import { PluginPackage } from "./types";
import { Plugin } from "./plugin";
import Command from "./commands/command";
import { PluginsEnum } from "./commands";
import { PluginType, PluginHeader } from "./enums";
import { PluginFileSystem } from "./file-system";

interface PipelineProperties {
  path: string;
  commands: boolean;
  initialize: boolean;
}

const DefaultPipelineProperties: PipelineProperties = {
  path: "./plugins",
  commands: true,
  initialize: true
};

class Pipeline {
  /**
   * The serenity server instance for the plugins pipeline.
   */
  protected readonly serenity: Serenity;

  /**
   * The properties for the plugins pipeline.
   */
  protected readonly properties: PipelineProperties;

  /**
   * The logger for the plugins pipeline.
   */
  public readonly logger = new Logger("Plugins", LoggerColors.MaterialLapis);

  /**
   * The plugins loaded in the pipeline.
   */
  public readonly plugins = new Map<string, Plugin>();

  /**
   * Whether the pipeline is running in ESM mode.
   */
  public readonly esm: boolean =
    typeof module !== "undefined" && module?.exports !== exports;

  /**
   * The path to the plugins directory.
   */
  public get path(): string {
    return this.properties.path;
  }

  /**
   * The path to the plugins directory.
   */
  public set path(_) {
    throw new Error("The path property is read-only.");
  }

  /**
   * Creates a new instance of the Pipeline class.
   * @param serenity The serenity server instance.
   * @param properties The properties for the pipeline.
   */
  public constructor(
    serenity: Serenity,
    properties?: Partial<PipelineProperties>
  ) {
    // Set the serenity server instance
    this.serenity = serenity;

    // Merge the properties with the default properties
    this.properties = { ...DefaultPipelineProperties, ...properties };

    // Hook into the serenity server events
    serenity.on(ServerEvent.Start, this.start.bind(this));
    serenity.on(ServerEvent.Stop, this.stop.bind(this));

    // Hook into the world initialize event
    serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
      // Register the commands for the plugins
      if (this.properties.commands) Command(world, this);

      // Iterate over all the plugins, and register the blocks, items, and entities
      for (const [, plugin] of this.plugins) {
        // Register the blocks for the world
        world.blockPalette
          .registerType(...plugin.blocks.types)
          .registerTrait(...plugin.blocks.traits);

        // Register the items for the world
        world.itemPalette
          .registerType(...plugin.items.types)
          .registerTrait(...plugin.items.traits);

        // Register the entities for the world
        world.entityPalette
          .registerType(...plugin.entities.types)
          .registerTrait(...plugin.entities.traits);
      }
    });

    // Check if the plugins should be initialized
    if (this.properties.initialize) this.initialize();
  }

  /**
   * Initializes the plugins pipeline.
   */
  public initialize(): void {
    // Check if the plugins directory exists
    if (!existsSync(resolve(this.path)))
      // If not, create the plugins directory
      mkdirSync(resolve(this.path), { recursive: true });

    // Check if a plugins data directory exists
    if (!existsSync(resolve(this.path, "data")))
      // If not, create the plugins data directory
      mkdirSync(resolve(this.path, "data"), { recursive: true });

    // Check if a plugins configs directory exists
    if (!existsSync(resolve(this.path, "configs")))
      // If not, create the plugins configs directory
      mkdirSync(resolve(this.path, "configs"), { recursive: true });

    // Read all the entries in the plugins directory
    // And filter out the data and configs directories
    const entries = readdirSync(resolve(this.path), {
      withFileTypes: true
    }).filter((dirent) =>
      dirent.isDirectory()
        ? dirent.name !== "data" && dirent.name !== "configs"
        : true
    );

    // Filter out all the files that have a .plugin extension
    const bundles = entries.filter((dirent) =>
      // Check if the entry is a file, and if it has a .plugin extension
      dirent.isFile() ? dirent.name.endsWith(".plugin") : false
    );

    // Array to hold the ordered plugins
    const orderedPlugins: Array<Plugin> = [];

    // Iterate over all the bundled plugins, and import them
    for (const bundle of bundles) {
      // Attempt to load the plugin
      try {
        // Get the path to the plugin
        const path = resolve(this.path, bundle.name);

        // Read the .plugin file and inflate it, and create a new binary stream
        const buffer = inflateSync(readFileSync(path));
        const stream = new BinaryStream(buffer);

        // Read the plugin header from the stream
        const type = stream.readByte() as PluginType | PluginHeader;

        switch (type) {
          case PluginHeader.HasNoResources: {
            // Read the length of the index file from the stream
            const length = stream.readVarInt();

            // Read the module entry point from the stream
            const index = stream.readBuffer(length).toString("utf-8");

            // Load the plugin from the text source
            const plugin = this.loadFromTextSource(path, index, true);

            // Push the plugin to the ordered plugins array
            if (plugin) orderedPlugins.push(plugin);

            // Break out of the switch statement
            break;
          }

          case PluginHeader.HasResources: {
            // Read the length of the index file from the stream
            const length = stream.readVarInt();

            // Read the module entry point from the stream
            const index = stream.readBuffer(length).toString("utf-8");

            // Load the plugin from the text source
            const plugin = this.loadFromTextSource(path, index, true);

            // Check if the plugin was loaded successfully
            if (!plugin) break;

            // Push the plugin to the ordered plugins array
            orderedPlugins.push(plugin);

            // Read the amount of resources from the stream
            const resources = stream.readVarInt();

            // Iterate over all the resources, and read them from the stream
            for (let i = 0; i < resources; i++) {
              // Attempt to read the resource pack
              try {
                // Read the length of the resource pack from the stream
                const length = stream.readVarInt();

                // Read the resource pack from the stream
                const buffer = stream.readBuffer(length);

                // Load the resource pack from the buffer
                const resource = this.serenity.resources.loadFromZip(buffer);

                // Log the successful load of the resource pack
                plugin.logger.success(
                  `Loaded resource pack §u${resource.name}§r (§8${resource.uuid}§r).`
                );

                // Add the resource pack to the plugin resources set
                plugin.resources.add(resource);
              } catch (reason) {
                // Log the error if the resource pack failed to load
                this.logger.error(
                  `Failed to load resource pack §8${relative(
                    process.cwd(),
                    resolve(this.path, bundle.name)
                  )}§r for plugin §1${plugin.identifier}§r.`,
                  reason
                );
              }
            }

            // Break out of the switch statement
            break;
          }

          // DEPRECATED: Eventually remove support for these plugin types
          case PluginType.Addon: {
            // We will handle addon plugins, but mention that they are deprecated
            this.logger.warn(
              `The plugin §1${relative(
                process.cwd(),
                resolve(this.path, bundle.name)
              )}§r is using a deprecated plugin type (Addon). Please update the plugin to use the new plugin system.`
            );

            // Read the module entry point from the stream
            const index = stream.readRemainingBuffer().toString("utf-8");

            // Load the plugin from the text source
            const plugin = this.loadFromTextSource(path, index, true);

            // Push the plugin to the ordered plugins array
            if (plugin) orderedPlugins.push(plugin);

            // Break out of the switch statement
            break;
          }

          // DEPRECATED: Eventually remove support for these plugin types
          case PluginType.Api: {
            // We no longer support API plugins
            this.logger.error(
              `The plugin §1${relative(
                process.cwd(),
                resolve(this.path, bundle.name)
              )}§r is using a deprecated plugin type (API). API plugins are no longer supported. Please update the plugin to use the new plugin system.`
            );
          }
        }
      } catch (reason) {
        // Log the error
        this.logger.error(
          `Failed to load plugin from "${relative(process.cwd(), resolve(this.path, bundle.name))}", skipping the plugin.`,
          reason
        );
      }
    }

    // Filter out all the directories from the entries
    const directories = readdirSync(resolve(this.path), {
      withFileTypes: true
    }).filter((dirent) => dirent.isDirectory());

    // Iterate over all the directories, checking if they are valid plugins
    for (const directory of directories) {
      // Attempt to load the plugin
      try {
        // Get the path to the plugin
        const path = resolve(this.path, directory.name);

        // Check if the plugin has a package.json file, if not, skip the plugin
        if (!existsSync(resolve(path, "package.json"))) continue;

        // Read the package.json file
        const manifest = JSON.parse(
          readFileSync(resolve(path, "package.json"), "utf-8")
        ) as PluginPackage;

        // Get the main entry point for the plugin
        const main = resolve(path, manifest.main);

        // Check if the provided entry point is valid
        if (!existsSync(resolve(path, main))) {
          this.logger.warn(
            `Unable to load plugin §u${manifest.name ?? "unknown-plugin"}§8@§u${manifest.version ?? "unknown-version"}§r, the main entry path "§8${relative(process.cwd(), resolve(path, main))}§r" was not found in the directory.`
          );

          // Skip the plugin
          continue;
        }

        // Import the plugin module
        const module = require(resolve(path, main));

        // Get the plugin class from the module
        const plugin = module.default as Plugin;

        // Check if the plugin has already been loaded
        if (this.plugins.has(plugin.identifier)) {
          this.logger.warn(
            `Unable to load plugin §u${plugin.identifier}§r, the plugin is already loaded in the pipeline.`
          );

          // Skip the plugin
          continue;
        }

        // Set the pipeline, serenity, and path for the plugin
        plugin.pipeline = this;
        plugin.serenity = this.serenity;
        plugin.path = path;
        plugin.isBundled = false;

        // Set the file system for the plugin
        plugin.fileSystem = new PluginFileSystem(
          resolve(plugin.path, "../data", plugin.identifier),
          plugin.logger
        );

        // Link the module to the pipeline
        this.linkModule(plugin.identifier, module);

        // Add the plugin to the plugins map
        this.plugins.set(plugin.identifier, plugin);

        // Add the plugin to the plugins enum
        PluginsEnum.options.push(plugin.identifier);

        // Push the plugin to the ordered plugins array
        orderedPlugins.push(plugin);

        // Check if a "resource_packs" directory exists in the plugin
        if (!existsSync(resolve(path, "resource_packs"))) {
          // Create the resource_packs directory
          mkdirSync(resolve(path, "resource_packs"));
        }

        // Read the contents of the resource_pack directory, only including directories
        const resources = readdirSync(resolve(path, "resource_packs"), {
          withFileTypes: true
        }).filter((dirent) => dirent.isDirectory());

        // Iterate over all the resource pack directories, and attempt to load them
        for (const resource of resources) {
          // Attempt to load the resource pack
          try {
            // Read the resource pack, and add it to the serenity resources
            const pack = this.serenity.resources.loadFromPath(
              resolve(path, "resource_packs", resource.name)
            );

            // Log the successful load of the resource pack
            plugin.logger.success(
              `Loaded resource pack §u${pack.name}§r (§8${pack.uuid}§r).`
            );

            // Add the resource pack to the plugin resources set
            plugin.resources.add(pack);
          } catch (reason) {
            // Log the error if the resource pack failed to load
            this.logger.error(
              `Failed to load resource pack §8${relative(
                process.cwd(),
                resolve(path, "resource_packs", resource.name)
              )}§r for plugin §1${plugin.identifier}§r.`,
              reason
            );
          }
        }
      } catch (reason) {
        // Log the error
        this.logger.error(
          `Failed to load plugin from "${relative(process.cwd(), resolve(this.path, directory.name))}", skipping the plugin.`,
          reason
        );
      }
    }

    // Sort the plugins by their priority
    orderedPlugins.sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority comes first
      }

      // If priority is the same, sort by identifier alphabetically
      if (a.identifier < b.identifier) return -1;
      if (a.identifier > b.identifier) return 1;
      return 0;
    });

    // Iterate over all the plugins, and initialize them
    for (const plugin of orderedPlugins) {
      // Check if the plugin has config defined
      if (Object.keys(plugin.config as object).length > 0) {
        // Create the path to the plugin config file
        const path = resolve(this.path, "configs", `${plugin.identifier}.json`);

        // Check if a config file exists for the plugin
        if (!existsSync(path)) {
          // Write the default config to the config file
          writeFileSync(path, JSON.stringify(plugin.config, null, 2));
        } else {
          // Read the config file
          const data = JSON.parse(readFileSync(path, "utf-8"));

          // Assign the config data to the plugin config
          Object.assign(plugin.config as object, data);
        }
      }

      // Initialize the plugin, and bind the events
      plugin.onInitialize(plugin);
      this.bindEvents(plugin);

      // Check if the plugin is bundled
      if (plugin.isBundled) {
        // Create a temporary path for the plugin
        const temp = resolve(plugin.path.slice(0, -7).replace(/\./g, "_"));

        // Delete the temporary file if it exists
        if (existsSync(temp)) process.nextTick(() => unlinkSync(temp));
      }
    }
  }

  /**
   * Starts the plugins pipeline.
   */
  public start(): void {
    // Start up all the plugins
    for (const plugin of this.plugins.values()) plugin.onStartUp(plugin);
  }

  /**
   * Stops the plugins pipeline.
   */
  public stop(): void {
    // Shut down all the plugins
    for (const plugin of this.plugins.values()) plugin.onShutDown(plugin);
  }

  /**
   * Load a plugin from a text source.
   * @param source The source code of the plugin.
   * @param isBundled Whether the plugin is bundled or not.
   */
  public loadFromTextSource(
    path: string,
    source: string,
    isBundled = false
  ): Plugin | null {
    // Create a temporary path for the plugin
    const temp = resolve(path.slice(0, -7).replace(/\./g, "_"));

    // Write the source to the temporary path
    writeFileSync(resolve(temp), source);

    // Attempt to load the plugin
    try {
      // Attempt to import the plugin module
      const module = require(resolve(temp));

      // Get the plugin class from the module
      const plugin = module.default as Plugin;

      // Check if the plugin has already been loaded
      if (this.plugins.has(plugin.identifier)) {
        // Log the warning that the plugin is already loaded
        this.logger.warn(
          `Unable to load plugin §u${plugin.identifier}§r, the plugin is already loaded in the pipeline.`
        );

        // Remove the temporary file
        unlinkSync(resolve(temp));

        // Skip the plugin
        return null;
      }

      // Set the pipeline, serenity, and path for the plugin
      plugin.pipeline = this;
      plugin.serenity = this.serenity;
      plugin.path = resolve(path);
      plugin.isBundled = isBundled;

      // Set the file system for the plugin
      plugin.fileSystem = new PluginFileSystem(
        resolve(plugin.path, "../data", plugin.identifier),
        plugin.logger
      );

      // Link the module to the pipeline
      this.linkModule(plugin.identifier, module);

      // Add the plugin to the plugins map
      this.plugins.set(plugin.identifier, plugin);

      // Add the plugin to the plugins enum
      PluginsEnum.options.push(plugin.identifier);

      // Return the plugin
      return plugin;
    } catch (reason) {
      // Log the error
      this.logger.error(
        `Failed to load plugin from §8${relative(process.cwd(), path)}§r, skipping the plugin.`,
        reason
      );

      // Remove the temporary file
      unlinkSync(resolve(temp));
    }

    // Return null if the plugin failed to load
    return null;
  }

  public reload(plugin: Plugin): void {
    // Shut down the plugin
    plugin.onShutDown(plugin);

    // Remove the plugin from the plugins map
    this.plugins.delete(plugin.identifier);

    // Get the plugin path
    const path = plugin.path;

    // Delete the require cache for the plugin
    delete require.cache[require.resolve(path)];

    // Remove the plugin from the serenity instance
    this.serenity.removePath(path);

    // Iterate over all the resources in the plugin, and remove them from the serenity instance
    for (const resource of plugin.resources) {
      // Remove the resource pack from the serenity instance
      this.serenity.resources.packs.delete(resource.uuid);
    }

    if (plugin.isBundled) {
      // Read the .plugin file and inflate it, and create a new binary stream
      const buffer = inflateSync(readFileSync(path));

      // Create a new binary stream from the buffer
      const stream = new BinaryStream(buffer);

      // Read the plugin header from the stream
      const type = stream.readByte() as PluginType | PluginHeader;

      switch (type) {
        case PluginHeader.HasNoResources: {
          // Read the length of the index file from the stream
          const length = stream.readVarInt();

          // Read the module entry point from the stream
          const index = stream.readBuffer(length).toString("utf-8");

          // Load the plugin from the text source
          const newPlugin = this.loadFromTextSource(path, index, true);

          // Check if the plugin was loaded successfully
          if (!newPlugin) break;

          // Initialize the plugin, and bind the events
          newPlugin.onInitialize(newPlugin);
          this.bindEvents(newPlugin);

          // Start up the plugin
          newPlugin.onStartUp(newPlugin);

          // Break out of the switch statement
          break;
        }

        case PluginHeader.HasResources: {
          // Read the length of the index file from the stream
          const length = stream.readVarInt();

          // Read the module entry point from the stream
          const index = stream.readBuffer(length).toString("utf-8");

          // Load the plugin from the text source
          const newPlugin = this.loadFromTextSource(path, index, true);

          // Check if the plugin was loaded successfully
          if (!newPlugin) break;

          // Initialize the plugin, and bind the events
          newPlugin.onInitialize(newPlugin);
          this.bindEvents(newPlugin);

          // Start up the plugin
          newPlugin.onStartUp(newPlugin);

          // Read the amount of resources from the stream
          const resources = stream.readVarInt();

          // Iterate over all the resources, and read them from the stream
          for (let i = 0; i < resources; i++) {
            // Attempt to load the resource pack
            try {
              // Read the length of the resource pack from the stream
              const length = stream.readVarInt();

              // Read the resource pack from the stream
              const buffer = stream.readBuffer(length);

              // Load the resource pack from the buffer
              const resource = this.serenity.resources.loadFromZip(buffer);

              // Log the successful load of the resource pack
              newPlugin.logger.success(
                `Loaded resource pack §u${resource.name}§r (§8${resource.uuid}§r).`
              );

              // Add the resource pack to the plugin resources set
              newPlugin.resources.add(resource);
            } catch (reason) {
              // Log the error if the resource pack failed to load
              this.logger.error(
                `Failed to load resource pack §8${relative(
                  process.cwd(),
                  resolve(this.path, path)
                )}§r for plugin §1${newPlugin.identifier}§r.`,
                reason
              );
            }
          }
        }
      }
    } else {
      // Read the package.json file
      const manifest = JSON.parse(
        readFileSync(resolve(path, "package.json"), "utf-8")
      ) as PluginPackage;

      // Get the main entry point for the plugin
      const main = resolve(path, manifest.main);

      // Check if the provided entry point is valid
      if (!existsSync(resolve(path, main))) {
        this.logger.warn(
          `Unable to reload plugin §u${manifest.name ?? "unknown-plugin"}§8@§u${manifest.version ?? "unknown-version"}§r, the main entry path "§8${relative(process.cwd(), resolve(path, main))}§r" was not found in the directory.`
        );

        // Skip the plugin
        return;
      }

      // Attempt to import the plugin module
      const module = require(resolve(path, main));

      // Get the plugin class from the module
      const newPlugin = module.default as Plugin;

      // Set the pipeline, serenity, and path for the plugin
      newPlugin.pipeline = this;
      newPlugin.serenity = this.serenity;
      newPlugin.path = path;
      newPlugin.isBundled = false;

      // Set the file system for the plugin
      newPlugin.fileSystem = new PluginFileSystem(
        resolve(newPlugin.path, "../data", newPlugin.identifier),
        newPlugin.logger
      );

      // Link the module to the pipeline
      this.linkModule(newPlugin.identifier, module);

      // Add the plugin to the plugins map
      this.plugins.set(newPlugin.identifier, newPlugin);

      // Add the plugin to the plugins enum
      PluginsEnum.options.push(newPlugin.identifier);

      // Initialize the plugin, and bind the events
      newPlugin.onInitialize(newPlugin);
      this.bindEvents(newPlugin);
    }
  }

  public bundle(plugin: Plugin): void {
    // Create a new BinaryStream instance
    const stream = new BinaryStream();

    // Determine the plugin header based on the resources
    const header =
      plugin.resources.size > 0
        ? PluginHeader.HasResources
        : PluginHeader.HasNoResources;

    // Write the plugin type to the stream
    stream.writeByte(header);

    // Switch based on the plugin header
    switch (header) {
      case PluginHeader.HasNoResources: {
        // Get the path to the plugin's compiled index file
        const path = resolve(plugin.path, "dist", "index.js");

        // Read the index file from the plugin
        const index = readFileSync(path);

        // Write the length of the index file to the stream
        stream.writeVarInt(index.byteLength);

        // Write the index file to the stream
        stream.writeBuffer(index);

        // Write the BinaryStream to the output path
        writeFileSync(
          resolve(this.path, `${plugin.identifier}-v${plugin.version}.plugin`),
          deflateSync(stream.getBuffer())
        );

        // Break out of the switch statement
        break;
      }

      case PluginHeader.HasResources: {
        // Get the path to the plugin's compiled index file
        const path = resolve(plugin.path, "dist", "index.js");

        // Read the index file from the plugin
        const index = readFileSync(path);

        // Write the length of the index file to the stream
        stream.writeVarInt(index.byteLength);

        // Write the index file to the stream
        stream.writeBuffer(index);

        // Write the amount of resources to the stream
        stream.writeVarInt(plugin.resources.size);

        // Iterate over all the resources, and write them to the stream
        for (const resource of plugin.resources) {
          // Compress the resource pack into a buffer
          const buffer = resource.compress();

          // Write the length of the resource pack to the stream
          stream.writeVarInt(buffer.byteLength);

          // Write the resource pack to the stream
          stream.writeBuffer(buffer);
        }

        // Write the BinaryStream to the output path
        writeFileSync(
          resolve(this.path, `${plugin.identifier}-v${plugin.version}.plugin`),
          deflateSync(stream.getBuffer())
        );

        // Break out of the switch statement
        break;
      }
    }
  }

  protected bindEvents(plugin: Plugin): void {
    // Get the prototype of the plugin
    const prototype = Object.getPrototypeOf(plugin);

    // Get the object keys from the plugin
    const pluginKeys = Object.getOwnPropertyNames(prototype);

    // Get the world event keys, and slice them in half
    let eventKeys = Object.keys(WorldEvent);
    eventKeys = eventKeys.slice(eventKeys.length / 2);

    // Iterate over all the event keys
    for (const eventKey of eventKeys) {
      // Get the index of the event key
      const index = eventKeys.indexOf(eventKey) as WorldEvent;

      // Check if the plugin has any "on" event keys
      if (pluginKeys.includes("on" + eventKey)) {
        // Get the value of the event key
        const value = plugin[("on" + eventKey) as keyof Plugin];

        // Check if the value is a function
        if (typeof value === "function")
          // Bind the event to the plugin
          this.serenity.on(index, value.bind(plugin) as () => void);
      }

      // Check if the plugin has any "before" event keys
      if (pluginKeys.includes("before" + eventKey)) {
        // Get the value of the event key
        const value = plugin[("before" + eventKey) as keyof Plugin];

        // Check if the value is a function
        if (typeof value === "function")
          // Bind the event to the plugin
          this.serenity.before(index, value.bind(plugin) as () => boolean);
      }

      // Check if the plugin has any "after" event keys
      if (pluginKeys.includes("after" + eventKey)) {
        // Get the value of the event key
        const value = plugin[("after" + eventKey) as keyof Plugin];

        // Check if the value is a function
        if (typeof value === "function")
          // Bind the event to the plugin
          this.serenity.after(index, value.bind(plugin) as () => void);
      }
    }
  }

  /**
   * Link a module to the pipeline.
   * @param name The name of the module to link.
   * @param module The module to link.
   */
  public linkModule(name: string, module: unknown): void {
    // Get the runtime of the server
    const isBun = process.versions.bun === undefined ? false : true;

    // Module linking is only supported in Bun
    if (!isBun) return;

    // Inject the module into the Bun plugin system
    Bun.plugin({
      name: `serenityjs.plugin.${name}`,
      setup(builder) {
        builder.module(name, () => {
          return {
            exports: module as Record<string, unknown>,
            loader: "object"
          };
        });
      }
    });
  }
}

export { Pipeline, DefaultPipelineProperties };
