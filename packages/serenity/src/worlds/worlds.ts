import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
	InternalProvider,
	Overworld,
	Superflat,
	Void,
	type TerrainGenerator,
	type World,
	type WorldProvider
} from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { DisconnectPacket, DisconnectReason } from "@serenityjs/protocol";

import { FileSystemProvider, LevelDBProvider } from "../providers";
import { exists } from "../utils/exists";
import { ADMIN_COMMANDS } from "../commands";

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
	 * The logger instance for the worlds manager.
	 */
	public readonly logger = new Logger("Worlds", LoggerColors.BlueBright);

	/**
	 * The path to the worlds directory.
	 */
	public readonly path: string;

	/**
	 * A collective registry of all world providers.
	 */
	public readonly providers = new Map<string, typeof WorldProvider>();

	/**
	 * A collective registry of all terrain generators.
	 */
	public readonly generators = new Map<string, typeof TerrainGenerator>();

	/**
	 * A collective registry of all worlds.
	 */
	public readonly entries = new Map<string, World>();

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

		// Register the default providers.
		this.registerProvider(InternalProvider);
		this.registerProvider(FileSystemProvider);
		this.registerProvider(LevelDBProvider);

		// Register the default generators.
		this.registerGenerator(Superflat);
		this.registerGenerator(Overworld);
		this.registerGenerator(Void);
	}

	/**
	 * Initialize the worlds manager.
	 */
	public async initialize(): Promise<void> {
		// Check if the worlds directory exists.
		if (!exists(this.path)) {
			// Log the creation of the worlds directory.
			this.logger.info(`Creating the worlds directory at "${this.path}"...`);

			// Create the worlds directory.
			await mkdirSync(this.path);
		}

		// Get all the directories in the worlds directory.
		// Exclude any files in the worlds directory.
		const directories = readdirSync(this.path, { withFileTypes: true }).filter(
			(dirent) => dirent.isDirectory()
		);

		// If the worlds directory is empty, then create the default world.
		if (directories.length === 0) {
			// Get the default world name.
			const defaultName = this.serenity.properties.getValue("worlds-default");

			// Create a "default" directory in the worlds directory.
			await mkdirSync(resolve(this.path, defaultName));

			// Create a ".provider" file in the "default" directory.
			const provider = this.serenity.properties.getValue(
				"worlds-default-provider"
			);

			// Write the provider to the ".provider" file.
			await writeFileSync(
				resolve(this.path, defaultName, ".provider"),
				provider
			);
		}
	}

	/**
	 * Start all the worlds.
	 */
	public async start(): Promise<void> {
		// Get all the directories in the worlds directory.
		// Exclude any files in the worlds directory.
		const directories = readdirSync(this.path, { withFileTypes: true }).filter(
			(dirent) => dirent.isDirectory()
		);

		// Loop through the directories in the worlds directory.
		// And check if the directory container a .provider file.
		for await (const directory of directories) {
			if (
				exists(resolve(this.path, directory.path, directory.name, ".provider"))
			) {
				// Get the path of the world
				const path = resolve(this.path, directory.path, directory.name);

				// Read the .provider file.
				const entry = readFileSync(resolve(path, ".provider"), "utf8");

				// Get the provider class instance.
				const provider = this.getProvider(entry);

				// Check if the provider is not undefined.
				if (provider) {
					// Initialize the world with the provider.
					const world = provider.initialize(
						resolve(this.path, directory.path, directory.name),
						[...this.generators.values()]
					);

					// Register the admin commands.
					for (const command of ADMIN_COMMANDS) {
						command(world, this.serenity);
					}

					// Add the world to the worlds map.
					this.entries.set(world.identifier, world);
				} else {
					// Log an error message.
					this.logger.error(
						`Failed to initialize world "${path}" with the provider "${entry}"`
					);

					// Log a warning message.
					this.logger.error("Make sure the provider is valid or registered.");
				}
			}
		}

		// Log the success message.
		const worlds = [...this.entries.values()].map(
			(world) => `§a${world.identifier}<§8${world.provider.identifier}§a>§r`
		);

		const s = worlds.length > 1 ? "s" : "";

		this.logger.success(
			`Successfully started a total of ${worlds.length} world${s}! ${worlds.join(", ")}`
		);
	}

	/**
	 * Stops all the worlds, saves them.
	 */
	public async stop(): Promise<void> {
		// Get the server shutdown message from the properties.
		const message = this.serenity.properties.getValue(
			"server-shutdown-message"
		);

		// Save all the worlds.
		for await (const world of this.entries.values()) {
			// Save the world.
			await world.provider.save(true);

			// Delete the world from the worlds map.
			this.entries.delete(world.identifier);

			// Create a new DisconnectPacket.
			const packet = new DisconnectPacket();
			packet.message = message;
			packet.hideDisconnectScreen = false;
			packet.reason = DisconnectReason.Shutdown;

			// Send the packet to all players.
			world.broadcastImmediate(packet);
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
	 * Register a world to the manager.
	 * @param world The world to register.
	 */
	public register(world: World): void {
		this.entries.set(world.identifier, world);
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

	public registerGenerator(generator: typeof TerrainGenerator): void {
		this.generators.set(generator.identifier, generator);
	}

	public getGenerator(identifier: string): typeof TerrainGenerator {
		return this.generators.get(identifier) as typeof TerrainGenerator;
	}

	public getAllGenerators(): Array<typeof TerrainGenerator> {
		return [...this.generators.values()];
	}
}

export { Worlds };
