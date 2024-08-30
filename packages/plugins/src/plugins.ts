import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { relative, resolve } from "node:path";
import process from "node:process";

import { Logger, LoggerColors } from "@serenityjs/logger";
import Emitter from "@serenityjs/emitter";

import { exists } from "./utils/exists";
import { unzip } from "./utils";

export interface Plugin {
	logger: Logger;
	package: { name: string; version: string; main: string };
	module: PluginModule;
}

interface PluginEvents {
	register: [Plugin];
	ready: [];
}

interface PluginModule {
	onInitialize?(...arguments_: Array<unknown>): void;
	onStartup?(...arguments_: Array<unknown>): void;
	onShutdown?(...arguments_: Array<unknown>): void;
}

class Plugins extends Emitter<PluginEvents> {
	/**
	 * The logger instance.
	 */
	public readonly logger = new Logger("Plugins", LoggerColors.Blue);

	/**
	 * The path to the plugins folder.
	 */
	public readonly path: string;

	/**
	 * Whether the plugins are enabled.
	 */
	public readonly enabled: boolean;

	/**
	 * A collection registry of all plugins.
	 */
	public readonly entries = new Map<string, Plugin>();

	/**
	 * Constructs a new plugins instance.
	 *
	 * @param serenity - The serenity instance.
	 */
	public constructor(path: string, enabled = true) {
		super();
		this.path = resolve(process.cwd(), path);
		this.enabled = enabled;
	}

	/**
	 * Initializes all plugins.
	 */
	public async initialize(...arguments_: Array<unknown>): Promise<void> {
		// Check if the plugins are enabled
		if (!this.enabled) {
			this.logger.warn("Plugins are set to be disabled.");
			return;
		}

		// Check if the plugins directory exists
		if (!exists(this.path)) {
			// Create the plugins directory
			try {
				await mkdirSync(this.path);
			} catch (reason) {
				this.logger.error(`Failed to create plugins directory!`, reason);
			}
		}

		// Check if there are any bundled plugins ".sjs" in the plugins directory
		const bundled = readdirSync(this.path).filter((file) =>
			file.endsWith(".sjs")
		);

		// Iterate over all bundled plugins
		for (const file of bundled) {
			// Unzip the bundled plugin
			unzip(resolve(this.path, file), this.path);

			// Remove the ".sjs" file
			rmSync(resolve(this.path, file));
		}

		// Read all directories with in the plugins directory
		const directories = readdirSync(this.path, {
			withFileTypes: true
		}).filter((dirent) => dirent.isDirectory());

		// Iterate over all directories, check if they can be loaded as a plugin
		for (const directory of directories) {
			// Get the path to the directory
			const path = resolve(this.path, directory.name);

			// Check if a package.json file exists
			// If it doesn't, then we will assume it is not a plugin
			// So will skip this directory
			if (!exists(resolve(path, "package.json"))) {
				// Log a debub message that the package.json file was not found
				this.logger.debug(
					`Skipping directory "${relative(process.cwd(), path)}", as a package.json was not found.`
				);

				// Skip this directory
				continue;
			}

			// Log a debug message that we are attempting to load the plugin
			this.logger.debug(
				`Attempting to load plugin "${relative(process.cwd(), path)}".`
			);

			// Read the package.json file
			const pak = JSON.parse(
				readFileSync(resolve(path, "package.json"), "utf8")
			) as { name: string; version: string; main: string };

			// Install the dependencies
			try {
				// Log a info message that we are installing the package dependencies
				this.logger.info(
					`Installing package dependencies for plugin §1${pak.name}§8@§1${pak.version}§r.`
				);

				// Execute the npm install command
				await execSync("npm install", { stdio: "ignore", cwd: path });
			} catch (reason) {
				// Log the error
				this.logger.error(
					`Failed to install package dependencies for plugin §1${pak.name}§8@§1${pak.version}§r!`,
					reason
				);
			}

			// Check if the plugin need to be compiled
			if (
				exists(resolve(path, "tsconfig.json")) &&
				!exists(resolve(path, "dist"))
			) {
				// Log a info message that we are compiling the plugin
				this.logger.info(
					`Compiling plugin §1${pak.name}§8@§1${pak.version}§r.`
				);

				// Execute the tsc command
				try {
					await execSync("npm run build", { stdio: "ignore", cwd: path });
				} catch (reason) {
					// Log the error
					this.logger.error(
						`Failed to compile plugin §1${pak.name}§8@§1${pak.version}§r!`,
						reason
					);
				}
			}

			// Check if the path to the main file exists
			// If it doesn't, then we will log a warning and skip this directory
			if (!exists(resolve(path, pak.main))) {
				// Log an warning message that the main file was not found
				this.logger.warn(
					`Unable to load plugin §1${pak.name}§8@§1${pak.version}§r, the main entry path "§8${relative(process.cwd(), resolve(path, pak.main))}§r" was not found in the directory.`
				);

				// Skip this directory
				continue;
			}

			// Import the plugin entry point
			const instance = await import(`file://${resolve(path, pak.main)}`);

			// Get the exported module
			const module = instance["default"] as PluginModule;

			// Create a new logger instance
			const logger = new Logger(
				`${pak.name}@${pak.version}`,
				LoggerColors.Blue
			);

			// Create a new plugin object
			const plugin = { package: pak, module, logger };

			// Store the plugin in the registry
			this.entries.set(pak.name, plugin);

			// Initialize the plugin
			if (module.onInitialize) {
				await module.onInitialize(...arguments_, plugin);
			}
		}

		// Map the plugins to a string array
		const plugins = [...this.entries.values()].map(
			(plugin) => `§1${plugin.package.name}§8@§1${plugin.package.version}§r`
		);
		const s = plugins.length > 1 ? "s" : "";

		// Log the success message
		this.logger.success(
			`Initializing §c${plugins.length}§r plugin${s}: ${plugins.join(", ")}§r`
		);
	}

	/**
	 * Starts all plugins.
	 */
	public async start(...arguments_: Array<unknown>): Promise<void> {
		// Call the onStartup method for all plugins
		for await (const plugin of this.entries.values()) {
			// Check if the plugin has an onStartup method
			if (plugin.module.onStartup) {
				// Call the onStartup method
				await plugin.module.onStartup(...arguments_, plugin);
			}
		}
	}

	/**
	 * Stops all plugins.
	 */
	public async stop(...arguments_: Array<unknown>): Promise<void> {
		// Call the onShutdown method for all plugins
		for await (const plugin of this.entries.values()) {
			// Check if the plugin has an onShutdown method
			if (plugin.module.onShutdown) {
				// Call the onShutdown method
				await plugin.module.onShutdown(...arguments_, plugin);
			}
		}
	}

	/**
	 * Imports a plugin module.
	 * @param name - The name of the plugin.
	 * @returns The plugin module.
	 */
	public import<T = PluginModule>(name: string): T {
		// Get the plugin from the registry
		const plugin = this.entries.get(name);

		// Check if the plugin exists
		if (!plugin) {
			throw new Error(`Plugin ${name} not found!`);
		}

		// Return the plugin module
		return plugin.module as T;
	}
}

export { Plugins };
