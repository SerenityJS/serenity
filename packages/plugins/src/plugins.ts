import { execSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync
} from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { Logger, LoggerColors } from "@serenityjs/logger";
import Emitter from "@serenityjs/emitter";

import { PLUGIN_TEMPLATE, TSCONFIG_TEMPLATE } from "./templates";

export interface Plugin {
	logger: Logger;
	config: PluginConfig;
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

interface PluginConfig {
	name: string;
	version: string;
	mode: "development" | "production";
	color: string;
	entry: string;
	node?: boolean;
	typescript?: boolean;
}

class Plugins extends Emitter<PluginEvents> {
	/**
	 * The logger instance.
	 */
	public readonly logger = new Logger("Plugins", LoggerColors.CyanBright);

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
		if (!existsSync(this.path)) {
			// Create the plugins directory
			try {
				await mkdirSync(this.path);
			} catch (reason) {
				this.logger.error(`Failed to create plugins directory!`, reason);
			}
		}

		// Read all directories with in the plugins directory
		const directories = readdirSync(this.path, {
			withFileTypes: true
		}).filter((dirent) => dirent.isDirectory());

		// Iterate over all directories, anc check if they are a plugin
		for (const directory of directories) {
			// Resolve the path to the directory
			const path = resolve(this.path, directory.name);

			// Check if the plugin.json file exists
			if (!existsSync(resolve(path, "plugin.json"))) {
				// Create the plugin.json file
				try {
					// Generate the plugin.json file from the template
					const config = PLUGIN_TEMPLATE.replace("plugin-name", directory.name);

					// Write the plugin.json file to the directory
					writeFileSync(resolve(path, "plugin.json"), config);
				} catch {
					this.logger.error(
						`Failed to create plugin.json for ${directory.name}`
					);
				}
			}

			// Read the plugin.json configuration file
			const config = JSON.parse(
				readFileSync(resolve(path, "plugin.json"), "utf8")
			) as PluginConfig;

			// Check if the plugin is using nodejs
			if (config.node === true) {
				// Check if the plugin contains a package.json file
				if (!existsSync(resolve(path, "package.json"))) {
					// Create the package.json file
					try {
						// Execute the npm init command
						execSync("npm init -y", { stdio: "ignore", cwd: path });
					} catch (reason) {
						// Log the error
						this.logger.error(
							`Failed to create package.json for ${config.name}@${config.version}!`,
							reason
						);
					}
				}

				// Check if the plugin contains a package-lock.json file
				if (!existsSync(resolve(path, "package-lock.json"))) {
					// Install the dependencies
					try {
						this.logger.info(
							`Installing dependencies for ${config.name}@${config.version}...`
						);

						// Execute the npm install command
						await execSync("npm install", { stdio: "ignore", cwd: path });
					} catch (reason) {
						// Log the error
						this.logger.error(
							`Failed to install dependencies for ${config.name}@${config.version}!`,
							reason
						);
					}
				}
			}

			// Check if the plugin is using typescript
			if (config.typescript === true) {
				// Check if the plugin contains a tsconfig.json file
				if (!existsSync(resolve(path, "tsconfig.json"))) {
					// Create the tsconfig.json file
					try {
						// Write the tsconfig.json file to the directory
						await writeFileSync(
							resolve(path, "tsconfig.json"),
							TSCONFIG_TEMPLATE
						);

						// Add the typescript compiler to the package.json file
						await execSync("npm pkg set scripts.build=tsc", {
							stdio: "ignore",
							cwd: path
						});
					} catch (reason) {
						this.logger.error(
							`Failed to create tsconfig.json for ${config.name}@${config.version}`,
							reason
						);
					}
				}

				// Check if the dist directory exists or if the plugin is in development mode
				if (
					!existsSync(resolve(path, "dist")) ||
					config.mode === "development"
				) {
					// Build the typescript files
					try {
						this.logger.info(
							`Building typescript files for ${config.name}@${config.version}...`
						);

						// Execute the build script
						await execSync("npm run build", { stdio: "ignore", cwd: path });
					} catch (reason) {
						// Log the error
						this.logger.error(
							`Failed to build typescript files for ${config.name}@${config.version}!`,
							reason
						);
					}
				}
			}

			try {
				// Resolve the path to the directory
				const path = resolve(this.path, directory.name);

				// Read the plugin.json configuration file
				const config = JSON.parse(
					readFileSync(resolve(path, "plugin.json"), "utf8")
				) as PluginConfig;

				// Import the plugin entry point
				const instance = await import(`file://${resolve(path, config.entry)}`);

				// Get the exported module
				const module = instance["default"];

				// Adjust the color to match the logger colors
				const adjustedColor = config.color
					.split("_")
					.map((part) => {
						return part.charAt(0).toUpperCase() + part.slice(1);
					})
					.join("");

				// Get the color from the logger colors
				const color =
					LoggerColors[adjustedColor as keyof typeof LoggerColors] ??
					LoggerColors.White;

				// Create a new logger instance
				const logger = new Logger(`${config.name}@${config.version}`, color);

				// Create a new plugin object
				const plugin = { config, module, logger };

				// Store the plugin in the registry
				this.entries.set(config.name, plugin);

				// Initialize the plugin
				if (module.onInitialize) {
					await module.onInitialize(...arguments_, plugin);
				}

				// Emit the register event
				this.emit("register", plugin);
			} catch (reason) {
				this.logger.error(`Failed to load plugin! ${directory.name}`, reason);
			}
		}

		// Log the success message
		const plugins = [...this.entries.values()].map(
			(plugin) => `${plugin.config.name}@${plugin.config.version}`
		);
		const s = plugins.length > 1 ? "s" : "";
		this.logger.success(
			`Successfully initialized a total of ${plugins.length} plugin${s}! §c${plugins.join(
				"§r, §c"
			)}§r`
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
