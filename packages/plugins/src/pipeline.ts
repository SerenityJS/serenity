import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { relative, resolve } from "node:path";
import { inflateSync } from "node:zlib";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { Serenity, ServerEvent } from "@serenityjs/core";
import { BinaryStream } from "@serenityjs/binarystream";

import { PluginPackage } from "./types";
import { Plugin } from "./plugin";

interface PipelineProperties {
  path: string;
}

const DefaultPipelineProperties: PipelineProperties = {
  path: "./plugins"
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
  }

  /**
   * Initializes the plugins pipeline.
   * @param complete The callback to call when the pipeline is initialized.
   * @returns A promise that resolves when the pipeline is initialized.
   */
  public async initialize(complete: () => void): Promise<void> {
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

        // Read the length of the module and main entry points
        let length = stream.readVarInt();
        const esm = stream.readBuffer(length).toString("utf-8");

        // Read the length of the main entry point
        length = stream.readVarInt();
        const cjs = stream.readBuffer(length).toString("utf-8");

        // Write the module or main entry points to temporary files
        const tempPath = resolve(this.path, `~${bundle.name.slice(0, -7)}`);
        writeFileSync(tempPath, this.esm ? esm : cjs);

        // Import the plugin module
        const module = await import(`file://${tempPath}`);

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

        // Set the pipeline & serenity for the plugin
        plugin.pipeline = this;
        plugin.serenity = this.serenity;

        // Add the plugin to the plugins map
        this.plugins.set(plugin.identifier, plugin);

        // Initialize the plugin
        plugin.onInitialize(plugin);

        // Add the temporary path to the set
        this.tempPaths.add(tempPath);
      } catch (reason) {
        // Log the error
        this.logger.warn(
          `Failed to load plugin from §8${relative(process.cwd(), resolve(this.path, bundle.name))}§r, skipping the plugin.`,
          reason
        );
      }
    }

    // Filter out all the directories from the entries
    const directories = entries.filter((dirent) => dirent.isDirectory());

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
        const main = resolve(path, this.esm ? manifest.module : manifest.main);

        // Check if the provided entry point is valid
        if (!existsSync(resolve(path, main))) {
          this.logger.warn(
            `Unable to load plugin §1${manifest.name}§8@§1${manifest.version}§r, the main entry path "§8${relative(process.cwd(), resolve(path, main))}§r" was not found in the directory.`
          );

          // Skip the plugin
          continue;
        }

        // Import the plugin module
        const module = await import(`file://${resolve(path, main)}`);

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

        // Set the pipeline & serenity for the plugin
        plugin.pipeline = this;
        plugin.serenity = this.serenity;

        // Add the plugin to the plugins map
        this.plugins.set(plugin.identifier, plugin);

        // Initialize the plugin
        plugin.onInitialize(plugin);
      } catch (reason) {
        // Log the error
        this.logger.warn(
          `Failed to load plugin from §8${relative(process.cwd(), resolve(this.path, directory.name))}§r, skipping the plugin.`,
          reason
        );
      }
    }

    // Call the complete callback
    return complete();
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
}

export { Pipeline, DefaultPipelineProperties };
