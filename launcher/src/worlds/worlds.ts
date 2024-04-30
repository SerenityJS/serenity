import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync
} from "node:fs";
import { resolve } from "node:path";

import {
	InternalProvider,
	type World,
	type WorldProvider
} from "@serenityjs/world";

import type { Serenity } from "../serenity";

// TODO: This is just a thought, bu maybe for ".provider" files, we could use YAML instead of plain text.
// This way, we could have more structured data and it would be easier to read and write.
// This would also allow to add comfiguration options to the provider.

class Worlds {
	/**
	 * The serenity instance.
	 */
	private readonly serenity: Serenity;

	/**
	 * The path to the worlds directory.
	 */
	public readonly path: string;

	/**
	 * A collective registry of all world providers.
	 */
	public readonly providers: Map<string, typeof WorldProvider>;

	/**
	 * A collective registry of all worlds.
	 */
	public readonly entries: Map<string, World>;

	/**
	 * Creates a new worlds manager.
	 *
	 * @param serenity The serenity instance.
	 * @returns A new worlds manager.
	 */
	public constructor(serenity: Serenity) {
		this.serenity = serenity;
		this.path = resolve(
			process.cwd(),
			serenity.properties.getValue("worlds-path")
		);
		this.providers = new Map();
		this.entries = new Map();

		// Register the default providers.
		this.registerProvider(InternalProvider);

		// Check if the worlds directory exists.
		if (!existsSync(this.path)) {
			// Create the worlds directory.
			mkdirSync(this.path);
		}

		// Get all the directories in the worlds directory.
		// Exclude any files in the worlds directory.
		const directories = readdirSync(this.path, { withFileTypes: true }).filter(
			(dirent) => dirent.isDirectory()
		);

		// If the worlds directory is empty, then create the default world.
		if (directories.length === 0) {
			// Get the default world name.
			const defaultName = serenity.properties.getValue("worlds-default");

			// Create a "default" directory in the worlds directory.
			mkdirSync(resolve(this.path, defaultName));

			// Create a ".provider" file in the "default" directory.
			const provider = serenity.properties.getValue("worlds-default-provider");

			// Write the provider to the ".provider" file.
			writeFileSync(resolve(this.path, defaultName, ".provider"), provider);

			// Add the directory to the directories array.
			directories.push(
				...readdirSync(this.path, { withFileTypes: true }).filter((dirent) =>
					dirent.isDirectory()
				)
			);
		}

		// Loop through the directories in the worlds directory.
		// And check if the directory container a .provider file.
		for (const directory of directories) {
			if (
				existsSync(
					resolve(this.path, directory.path, directory.name, ".provider")
				)
			) {
				// Read the .provider file.
				const entry = readFileSync(
					resolve(this.path, directory.path, directory.name, ".provider"),
					"utf8"
				);

				// Get the provider class instance.
				const provider = this.getProvider(entry);

				// Check if the provider is not undefined.
				if (provider) {
					// Initialize the world with the provider.
					const world = provider.intialize(
						resolve(this.path, directory.path, directory.name)
					);

					// Add the world to the worlds map.
					this.entries.set(world.identifier, world);
				} else {
					// Log an error message.
					serenity.logger.error(
						`Failed to initialize a world with the given provider "${entry}." Make sure the provider is valid or registered.`
					);

					// Log the world path.
					serenity.logger.error(
						`World Path: ${resolve(this.path, directory.path, directory.name)}`
					);
				}
			}
		}
	}

	/**
	 * Get the world with the given name.
	 * If there is no name provided, then it will return the default world.
	 * @param name The name of the world.
	 * @returns The world with the given name.
	 */
	public get(name?: string): World {
		// Return the world with the given name.
		return this.entries.get(
			name ?? this.serenity.properties.getValue("worlds-default")
		) as World;
	}

	/**
	 * Get all the worlds.
	 * @returns All the worlds.
	 */
	public getAll(): Array<World> {
		return [...this.entries.values()];
	}

	/**
	 * Register a new world provider.
	 * @param provider The world provider.
	 */
	public registerProvider(provider: typeof WorldProvider): void {
		this.providers.set(provider.identifier, provider);
	}

	/**
	 * Get the provider with the given identifier.
	 * @param identifier The identifier of the provider.
	 * @returns The provider with the given identifier.
	 */
	public getProvider(identifier: string): typeof WorldProvider {
		return this.providers.get(identifier) as typeof WorldProvider;
	}

	/**
	 * Get all the providers.
	 * @returns All the providers.
	 */
	public getAllProviders(): Array<typeof WorldProvider> {
		return [...this.providers.values()];
	}
}

export { Worlds };
