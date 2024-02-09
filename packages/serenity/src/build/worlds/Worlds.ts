import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { stringify } from 'yaml';
import type { Logger } from '../../console';

const DEFAULT_WORLD_PROPERTIES = {
	name: 'Default World',
	seed: 12_345,
	defaultDimension: 'minecraft:overworld',
};

const DEFAULT_DIMENSION_PROPERTIES = {
	identifier: 'minecraft:overworld',
	type: 'minecraft:overworld',
	generator: 'minecraft:flat',
	spawnPosition: { x: 0, y: 0, z: 0 },
};

class WorldParser {
	public static readonly path = resolve(process.cwd(), 'worlds');

	public static readonly default = DEFAULT_WORLD_PROPERTIES;

	public static readonly defaultDimension = DEFAULT_DIMENSION_PROPERTIES;

	/**
	 * The logger instance.
	 */
	protected readonly logger: Logger;

	public constructor(logger: Logger) {
		this.logger = logger;
		this.load();
	}

	private load(): void {
		// Check if the worlds directory exists.
		if (!readdirSync(process.cwd()).includes('worlds')) {
			// Create the worlds directory.
			mkdirSync(WorldParser.path);
			// Log that the worlds directory was created.
			this.logger.success('Created worlds directory.');
		}

		// Check if there are no worlds.
		if (!readdirSync(WorldParser.path).length) {
			// Create the default world.
			this.createWorld('default-world');

			// Log that the default world was created.
			this.logger.success('Created default world.');
		}

		// Loop through each world.
		// And check if it has a dimension directory and a world.properties file.
		for (const world of readdirSync(WorldParser.path)) {
			// Check if the world has a world.properties file.
			if (!readdirSync(resolve(WorldParser.path, world)).includes('world.properties')) {
				// Create the world.properties file.
				// Write the default world properties to the file.
				WorldParser.default.name = world;
				writeFileSync(
					resolve(WorldParser.path, world, 'world.properties'),
					stringify(WorldParser.default, { indent: 2 }),
				);
			}

			// Check if the world is a directory.
			if (!readdirSync(resolve(WorldParser.path, world)).includes('dimensions')) {
				// Create the dimensions directory.
				mkdirSync(resolve(WorldParser.path, world, 'dimensions'));
			}

			// Check if the world has no dimensions.
			if (!readdirSync(resolve(WorldParser.path, world, 'dimensions')).length) {
				// Create the default dimension.
				// And the default dimension properties for that dimension.
				mkdirSync(resolve(WorldParser.path, world, 'dimensions', 'minecraft:overworld'.replace(':', '_')));
			}

			// Loop through each dimension.
			// And check if it has a dimension.properties file.
			for (const dimension of readdirSync(resolve(WorldParser.path, world, 'dimensions'))) {
				// Check if the dimension has a dimension.properties file.
				if (
					!readdirSync(resolve(WorldParser.path, world, 'dimensions', dimension.replace(':', '_'))).includes(
						'dimension.properties',
					)
				) {
					// And create the default dimension.
					// And the default dimension properties for that dimension.
					WorldParser.defaultDimension.identifier = dimension.replace('_', ':');
					writeFileSync(
						resolve(WorldParser.path, world, 'dimensions', dimension.replace(':', '_'), 'dimension.properties'),
						stringify(WorldParser.defaultDimension, { indent: 2 }),
					);
				}
			}

			// Check if the world has a players directory.
			if (!readdirSync(resolve(WorldParser.path, world)).includes('players')) {
				// Create the players directory.
				mkdirSync(resolve(WorldParser.path, world, 'players'));
			}
		}
	}

	public createWorld(name: string): void {
		const worldPath = resolve(WorldParser.path, name);

		// Check if the world exists.
		if (readdirSync(WorldParser.path).includes(name)) {
			// Log that the world already exists.
			this.logger.error(`Failed to create world, world [${name}] already exists!`);
		}

		// Create the world directory.
		mkdirSync(worldPath);
	}
}

export { WorldParser };
