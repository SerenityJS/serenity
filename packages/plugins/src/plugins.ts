import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { Logger, LoggerColors } from "@serenityjs/logger";

import type { BasePlugin } from "./base";

interface Plugin {
	instance: BasePlugin;
	package: Record<string, unknown>;
	plugin: unknown;
}

interface tsconfig {
	compilerOptions: {
		outDir: string;
	};
}

class Plugins<T> {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: T;

	/**
	 * The logger instance.
	 */
	public readonly logger: Logger;

	/**
	 * The path to the plugins folder.
	 */
	public readonly path: string;

	/**
	 * The plugins map.
	 */
	public readonly plugins: Map<string, Plugin>;

	/**
	 * Constructs a new plugins instance.
	 *
	 * @param serenity - The serenity instance.
	 */
	public constructor(serenity: T, path: string, enabled = true) {
		this.serenity = serenity;
		this.logger = new Logger("Plugins", LoggerColors.CyanBright);
		this.path = resolve(process.cwd(), path);
		this.plugins = new Map();

		// Check if plugins are enabled
		if (enabled) {
			// Check if the plugins folder exists
			if (!existsSync(this.path)) {
				// Create plugins folder
				mkdirSync(this.path);

				// Log the creation of the plugins folder and its path
				this.logger.success(`Created plugins folder at "${this.path}"`);
			}

			// Load the plugins
			void this.loadNew();
		}
	}

	public async loadNew(): Promise<void> {
		// Read the plugins folder
		const files = readdirSync(this.path, { withFileTypes: true });

		// Loop through the directory, reading each file within it
		for (const file of files) {
			// Check if the file is a directory
			if (!file.isDirectory()) continue;

			// Read the path of the plugin
			// And read the directory
			const files = readdirSync(resolve(file.path, file.name), {
				withFileTypes: true
			});

			// Check if the plugin has a package.json file
			const packExsist = files.find((file) => file.name === "package.json");
			if (!packExsist) {
				this.logger.error(
					`Plugin "${file.name}" does not contain a package.json file.`
				);
				continue;
			}

			// Read the package.json file
			const pack = JSON.parse(
				readFileSync(resolve(packExsist.path, packExsist.name), "utf8")
			);

			// Validate the package.json file
			if (!this.validatePackage(file.name, pack)) continue;

			// Check if the plugin has a node_modules folder
			const needModules = existsSync(
				resolve(file.path, file.name, "node_modules")
			);

			// Install the node_modules folder
			if (!needModules) {
				try {
					execSync("npm install", { cwd: resolve(file.path, file.name) });
				} catch {
					this.logger.error(
						`Failed to install node_modules for plugin "${file.name}".`
					);
					continue;
				}

				// Log the success of the installation
				this.logger.success(
					`Installed node_modules for plugin "${file.name}".`
				);
			}

			// Check if the plugin is using TypeScript
			const typescript = files.find((file) => file.name === "tsconfig.json");

			// If the plugin is using TypeScript, validate the tsconfig.json file
			const tsconfig = typescript
				? JSON.parse(
						readFileSync(resolve(typescript.path, typescript.name), "utf8")
					)
				: null;

			// Validate the tsconfig.json file
			if (typescript && !this.validateTsconfig(file.name, tsconfig)) continue;

			// Check if the plugin needs to be compiled
			const needToCompile = Boolean(
				(typescript &&
					!existsSync(
						resolve(file.path, file.name, tsconfig.compilerOptions.outDir)
					)) ||
					Boolean(pack?.development ?? false) === true
			);

			// Check if the package.json has a specific build script,
			// If it doesn't, it will use the default build script (tsc).
			if (needToCompile) {
				try {
					// Check if the plugin has a build script
					if (pack?.scripts?.build) {
						execSync("npm run build", { cwd: resolve(file.path, file.name) });
					} else {
						execSync("tsc", { cwd: resolve(file.path, file.name) });
					}

					// Log the success of the compilation
					this.logger.success(`Compiled plugin "${file.name}".`);
				} catch {
					// Log the failure of the compilation
					this.logger.error(`Failed to compile plugin "${file.name}".`);

					// Skip the plugin
					continue;
				}
			}

			try {
				// Import the plugin
				const plugin = await import(
					`file://${resolve(file.path, file.name, pack.main)}`
				);

				// Check if the plugin has a default export
				if (!plugin.default) continue;

				// Create a new instance of the plugin
				const instance = new plugin.default(
					this.serenity,
					new Logger(`${file.name}@${pack.version}`, LoggerColors.Blue)
				);

				// Add the plugin to the plugins map
				this.plugins.set(file.name, { instance, package: pack, plugin });
			} catch {
				this.logger.error(`Failed to import plugin "${file.name}".`);
				continue;
			}
		}
	}

	public validatePackage(path: string, pack: Record<string, unknown>): boolean {
		// Check if the package.json contains a "name" property
		if (!pack?.name) {
			this.logger.error(
				`Plugin package.json "${path}" does not contain a "name" property.`
			);
			return false;
		}

		// Check if the package.json contains a "version" property
		if (!pack?.version) {
			this.logger.error(
				`Plugin package.json "${path}" does not contain a "version" property.`
			);
			return false;
		}

		// Check if the package.json contains a "type" property
		// And check if the type is set to "module"
		if (!pack?.type) {
			this.logger.error(
				`Plugin package.json "${path}" does not contain a "type" property.`
			);
			return false;
		} else if (pack.type !== "module") {
			this.logger.error(
				`Plugin package.json "${path}" type is not set to "module".`
			);
			return false;
		}

		// Check if the package.json contains a "main" property
		if (!pack?.main) {
			this.logger.error(
				`Plugin package.json "${path}" does not contain a "main" property.`
			);
			return false;
		}

		return true;
	}

	public validateTsconfig(path: string, tsconfig: tsconfig): boolean {
		// Check if the tsconfig.json contains a "compilerOptions" property
		if (!tsconfig?.compilerOptions) {
			this.logger.error(
				`Plugin tsconfig.json "${path}" does not contain a "compilerOptions" property.`
			);
			return false;
		}

		// Check if the tsconfig.json contains a "outDir" property
		if (!tsconfig?.compilerOptions?.outDir) {
			this.logger.error(
				`Plugin tsconfig.json "${path}" does not contain a "outDir" property.`
			);
			return false;
		}

		return true;
	}
}

export { Plugins };
