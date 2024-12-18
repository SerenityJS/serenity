/* eslint-disable @typescript-eslint/no-require-imports */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { relative, resolve } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";
import { execSync } from "node:child_process";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { Serenity, ServerEvent, WorldEvent } from "@serenityjs/core";
import { BinaryStream } from "@serenityjs/binarystream";

import { PluginPackage } from "./types";
import { Plugin } from "./plugin";
import Command from "./commands/command";
import { PluginsEnum } from "./commands";
import { PluginType } from "./enums";

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
  public readonly logger = new Logger("Plugins", LoggerColors.CyanBright);

  /**
   * The plugins loaded in the pipeline.
   */
  public readonly plugins = new Map<string, Plugin>();

  /**
   * The temporary paths used by the pipeline.
   */
  protected readonly tempPaths = new Set<string>();

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

    // Check if the plugins command should be registered
    if (this.properties.commands) {
      // Hook into the world initialize event
      serenity.on(WorldEvent.WorldInitialize, ({ world }) =>
        Command(world, this)
      );
    }

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

    // Read all the entries in the plugins directory
    const entries = readdirSync(resolve(this.path), {
      withFileTypes: true
    });

    // Filter out all the files that have a .plugin extension
    const bundles = entries.filter((dirent) =>
      dirent.isFile() ? dirent.name.endsWith(".plugin") : false
    );

    // Iterate over all the bundled plugins, and import them
    for (const bundle of bundles) {
      // Attempt to load the plugin
      try {
        // Get the path to the plugin
        const path = resolve(this.path, bundle.name);

        // Read the .plugin file and inflate it, and create a new binary stream
        const buffer = inflateSync(readFileSync(path));
        const stream = new BinaryStream(buffer);

        // Read the plugin type from the stream
        const type = stream.readByte();

        // Check if the plugin type is valid
        if (type === PluginType.Addon) {
          // Read the module entry point from the stream
          const index = stream.readRemainingBuffer().toString("utf-8");

          // Write the module or main entry points to temporary files
          const tempPath = resolve(this.path, bundle.name.slice(0, -7));
          writeFileSync(tempPath, index);

          // Import the plugin module
          const module = require(tempPath);

          // Get the plugin class from the module
          const plugin = module.default as Plugin;

          // Check if the plugin is an instance of the Plugin class
          if (!(plugin instanceof Plugin)) {
            this.logger.warn(
              `Unable to load plugin from §8${relative(process.cwd(), path)}§r, the plugin is not an instance of the Plugin class.`
            );

            // Skip the plugin
            continue;
          }

          // Check if the plugin has already been loaded
          if (this.plugins.has(plugin.identifier)) {
            this.logger.warn(
              `Unable to load plugin §1${plugin.identifier}§r, the plugin is already loaded in the pipeline.`
            );

            // Skip the plugin
            continue;
          }

          // Set the pipeline, serenity, and path for the plugin
          plugin.pipeline = this;
          plugin.serenity = this.serenity;
          plugin.path = path;
          plugin.isBundled = true;

          // Add the plugin to the plugins map
          this.plugins.set(plugin.identifier, plugin);

          // Initialize the plugin and bind the events
          plugin.onInitialize(plugin);
          this.bindEvents(plugin);

          // Add the plugin to the plugins enum
          PluginsEnum.options.push(plugin.identifier);

          // Add the temporary path to the set
          this.tempPaths.add(tempPath);
        } else if (type === PluginType.Api) {
          // Read the buffer from the stream
          const buffer = stream.readRemainingBuffer();

          // Delete the .plugin file
          unlinkSync(path);

          // Write the buffer to a temporary file
          const tempPath = resolve(this.path, bundle.name.slice(0, -7));

          // Write the buffer to the temporary file
          writeFileSync(tempPath, buffer);

          // Extract the tarball to the plugins directory
          execSync(`tar -xzf ${tempPath} -C ${this.path}`, {
            stdio: "ignore"
          });

          // Delete the temporary file
          unlinkSync(tempPath);

          // Get the plugin name from the tarball
          const name = bundle.name.slice(0, -7);

          // Rename the extracted "package" directory to the plugin name
          renameSync(resolve(this.path, "package"), resolve(this.path, name));

          // Install the dependencies for the plugin
          execSync("npm install", {
            cwd: resolve(this.path, name),
            stdio: "ignore"
          });
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
        // const main = resolve(path, this.esm ? manifest.module : manifest.main);
        const main = resolve(path, manifest.main);

        // Check if the provided entry point is valid
        if (!existsSync(resolve(path, main))) {
          this.logger.warn(
            `Unable to load plugin §1${manifest.name}§8@§1${manifest.version}§r, the main entry path "§8${relative(process.cwd(), resolve(path, main))}§r" was not found in the directory.`
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
            `Unable to load plugin §1${plugin.identifier}§r, the plugin is already loaded in the pipeline.`
          );

          // Skip the plugin
          continue;
        }

        // Set the pipeline, serenity, and path for the plugin
        plugin.pipeline = this;
        plugin.serenity = this.serenity;
        plugin.path = path;
        plugin.isBundled = false;

        // Add the plugin to the plugins map
        this.plugins.set(plugin.identifier, plugin);

        // Add the plugin to the plugins enum
        PluginsEnum.options.push(plugin.identifier);

        // Initialize the plugin, and bind the events
        plugin.onInitialize(plugin);
        this.bindEvents(plugin);
      } catch (reason) {
        // Log the error
        this.logger.error(
          `Failed to load plugin from "${relative(process.cwd(), resolve(this.path, directory.name))}", skipping the plugin.`,
          reason
        );
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

    // Delete all the temporary files
    for (const tempPath of this.tempPaths) {
      // Delete the temporary file
      unlinkSync(tempPath);
    }
  }

  public reload(plugin: Plugin): void {
    // Shut down the plugin
    plugin.onShutDown(plugin);

    // Remove the plugin from the plugins map
    this.plugins.delete(plugin.identifier);

    // Get the plugin path
    const path = plugin.path;

    // Delete the require cache for the plugin
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Dynamic delete is required here
    delete require.cache[require.resolve(path)];

    // Remove the plugin from the serenity instance
    this.serenity.removePath(path);

    // Attempt to load the plugin
    try {
      // Import the plugin module

      const module = require(path);

      // Get the plugin class from the module
      const rPlugin = module.default as Plugin;

      // Check if the plugin is an instance of the Plugin class
      if (!(rPlugin instanceof Plugin)) {
        this.logger.warn(
          `Unable to reload plugin from §8${relative(process.cwd(), path)}§r, the plugin is not an instance of the Plugin class.`
        );

        // Skip the plugin
        return;
      }

      // Set the pipeline, serenity, and path for the plugin
      rPlugin.pipeline = this;
      rPlugin.serenity = this.serenity;
      rPlugin.path = path;

      // Add the plugin to the plugins map
      this.plugins.set(rPlugin.identifier, rPlugin);

      // Initialize the plugin
      rPlugin.onInitialize(rPlugin);
      this.bindEvents(rPlugin);

      // Start up the plugin
      rPlugin.onStartUp(rPlugin);

      // Log the successful reload
      this.logger.info(
        `Successfully reloaded plugin §1${rPlugin.identifier}§r from §8${relative(process.cwd(), path)}§r.`
      );
    } catch (reason) {
      // Log the error
      this.logger.error(
        `Failed to reload plugin from §8${relative(process.cwd(), path)}§r, skipping the plugin.`,
        reason
      );
    }
  }

  public bundle(plugin: Plugin): void {
    // Create a new BinaryStream instance
    const stream = new BinaryStream();

    // Write the plugin type to the stream
    stream.writeByte(plugin.type);

    if (plugin.type === PluginType.Addon) {
      // Get the addon path
      const inputPath = resolve(plugin.path, "dist");

      // Read the index file
      const index = readFileSync(resolve(inputPath, "index.js"));

      // Write the module entry point to the stream
      stream.writeBuffer(index);

      // Write the BinaryStream to the output path
      writeFileSync(
        resolve(this.path, `${plugin.identifier}.plugin`),
        deflateSync(stream.getBuffer())
      );
    } else if (plugin.type === PluginType.Api) {
      // Pack the plugin
      execSync("npm pack", { cwd: plugin.path, stdio: "ignore" });

      // Get the tarball path
      const tarball = readdirSync(plugin.path).find((file) =>
        file.endsWith(".tgz")
      );

      // Check if the tarball exists
      if (!tarball) throw new Error("Packed tarball not found.");

      // Read the tarball file
      const buffer = readFileSync(resolve(plugin.path, tarball));

      // Delete the tarball file
      unlinkSync(resolve(plugin.path, tarball));

      // Write the buffer to the output path
      stream.writeBuffer(buffer);

      // Write the buffer to the output path
      writeFileSync(
        resolve(this.path, `${plugin.identifier}.plugin`),
        deflateSync(stream.getBuffer())
      );
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
}

export { Pipeline, DefaultPipelineProperties };
