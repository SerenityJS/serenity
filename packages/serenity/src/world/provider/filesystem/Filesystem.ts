import { Buffer } from 'node:buffer';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { BinaryStream } from '@serenityjs/binarystream';
import { parse, stringify } from 'yaml';
import type { Serenity } from '../../../Serenity';
import { Logger } from '../../../console';
import { DEFAULT_PLAYER_PROPERTIES } from '../../../player';
import type { DimensionProperties, PlayerProperties, WorldProperties } from '../../../types';
import { DEFAULT_DIMENSION_PROPERTIES, DEFAULT_WORLD_PROPERTIES } from '../../Properties';
import { World } from '../../World';
import { Chunk } from '../../chunk';
import { Dimension } from '../../dimension';
import { BetterFlat } from '../../generator';
import { Provider } from '../Provider';

class Filesystem extends Provider {
	public static readonly logger = new Logger('Filesystem', '#2406bd');

	public readonly serenity: Serenity;
	public readonly path: string;

	public constructor(serenity: Serenity, path: string) {
		super();
		this.serenity = serenity;
		this.path = path;
	}

	public readChunks(dimension: Dimension): Chunk[] {
		const path = resolve(this.path, 'dimensions', dimension.properties.identifier.replace(':', '-'), 'storage.bin');

		const stream = new BinaryStream(readFileSync(path));

		if (stream.cursorAtEnd()) return [];

		const chunks = [];

		do {
			const x = stream.readZigZag();
			const z = stream.readZigZag();
			const length = stream.readVarInt();
			const buffer = stream.readBuffer(length);

			chunks.push(Chunk.deserialize(x, z, buffer));
		} while (!stream.cursorAtEnd());

		return chunks;
	}

	public writeChunks(chunks: Chunk[], dimension: Dimension): void {
		const path = resolve(this.path, 'dimensions', dimension.properties.identifier.replace(':', '-'), 'storage.bin');

		const stream = new BinaryStream();

		for (const chunk of chunks) {
			const buffer = chunk.serialize();

			stream.writeZigZag(chunk.x);
			stream.writeZigZag(chunk.z);
			stream.writeVarInt(buffer.byteLength);
			stream.writeBuffer(buffer);
		}

		writeFileSync(path, stream.getBuffer());
	}

	public readProperties(): WorldProperties {
		try {
			return parse(readFileSync(resolve(this.path, 'world.properties'), 'utf8'));
		} catch {
			Filesystem.logger.error(`Failed to read world properties at "${resolve(this.path, 'world.properties')}"`);

			return DEFAULT_WORLD_PROPERTIES;
		}
	}

	public writeProperties(properties: WorldProperties): void {
		try {
			writeFileSync(resolve(this.path, 'world.properties'), stringify(properties, { indent: 2 }));
		} catch {
			Filesystem.logger.error(`Failed to write world properties at "${resolve(this.path, 'world.properties')}"`);
		}
	}

	public readPlayerProperties(xuid: string): PlayerProperties {
		try {
			return JSON.parse(readFileSync(resolve(this.path, 'players', `${xuid}.json`), 'utf8'));
		} catch {
			return DEFAULT_PLAYER_PROPERTIES;
		}
	}

	public writePlayerProperties(xuid: string, properties: PlayerProperties): void {
		try {
			writeFileSync(resolve(this.path, 'players', `${xuid}.json`), JSON.stringify(properties, null, 2));
		} catch {
			Filesystem.logger.error(
				`Failed to write player properties at "${resolve(this.path, 'players', `${xuid}.json`)}"`,
			);
		}
	}

	public readDimensionsProperties(): DimensionProperties[] {
		try {
			// Read each dimension properties file in the dimensions directory.
			return readdirSync(resolve(this.path, 'dimensions')).map((dimension) => {
				return parse(readFileSync(resolve(this.path, 'dimensions', dimension, 'dimension.properties'), 'utf8'));
			});
		} catch {
			Filesystem.logger.error(`Failed to read dimensions at "${resolve(this.path, 'dimensions')}"`);

			return [];
		}
	}

	public static initialize(serenity: Serenity, path: string): void {
		try {
			// Check if the worlds directory exists.
			if (!readdirSync(process.cwd()).includes('worlds')) {
				// Create the worlds directory.
				mkdirSync(path);

				// Log the creation of the worlds directory.
				// And its path.
				this.logger.success(`Created worlds directory at "${path}"`);
			}

			// Now we will check if the default world exists.
			// If it does not, we will create it.
			if (!readdirSync(path).includes(serenity.properties.values.world.default)) {
				// Create the default world directory.
				mkdirSync(resolve(path, serenity.properties.values.world.default));

				// Log the creation of the default world directory.
				// And its path.
				this.logger.success(
					`Created default world directory at "${resolve(path, serenity.properties.values.world.default)}"`,
				);

				// Initialize the default world properties.
				// And update the default world properties with the default world name.
				const properties = DEFAULT_WORLD_PROPERTIES;
				properties.name = serenity.properties.values.world.default;

				// Write the default world properties to the file.
				writeFileSync(
					resolve(path, serenity.properties.values.world.default, 'world.properties'),
					stringify(properties, { indent: 2 }),
				);

				// Create the dimensions directory.
				mkdirSync(resolve(path, serenity.properties.values.world.default, 'dimensions'));

				// Create the default dimension directory.
				mkdirSync(
					resolve(path, serenity.properties.values.world.default, 'dimensions', properties.dimension.replace(':', '-')),
				);

				// Create the players directory.
				mkdirSync(resolve(path, serenity.properties.values.world.default, 'players'));
			}

			// Loop through each world in the worlds directory.
			// Check if they contain a world.properties file, a dimensions directory, and a players directory.
			// If they don't, we will create them.
			for (const world of readdirSync(path)) {
				// Check if the world has a world.properties file.
				if (!readdirSync(resolve(path, world)).includes('world.properties')) {
					// Write the default world properties to the file.
					DEFAULT_WORLD_PROPERTIES.name = world;
					writeFileSync(resolve(path, world, 'world.properties'), stringify(DEFAULT_WORLD_PROPERTIES, { indent: 2 }));

					// Log the creation of the missing world properties file.
					// And its path of the world.
					this.logger.success(`Created missing world properties file at "${resolve(path, world, 'world.properties')}"`);
				}

				// Check if the world has a dimensions directory.
				if (!readdirSync(resolve(path, world)).includes('dimensions')) {
					// Create the dimensions directory.
					mkdirSync(resolve(path, world, 'dimensions'));

					// Create the default dimension directory.
					mkdirSync(resolve(path, world, 'dimensions', DEFAULT_WORLD_PROPERTIES.dimension.replace(':', '-')));

					// Log the creation of the missing dimensions directory.
					// And its path of the world.
					this.logger.success(`Created missing dimensions directory at "${resolve(path, world, 'dimensions')}"`);
				}

				// Check if the world has a players directory.
				if (!readdirSync(resolve(path, world)).includes('players')) {
					// Create the players directory.
					mkdirSync(resolve(path, world, 'players'));

					// Log the creation of the missing players directory.
					// And its path of the world.
					this.logger.success(`Created missing players directory at "${resolve(path, world, 'players')}"`);
				}

				// Loop through each dimension in the dimensions directory.
				// Check if they contain a dimension.properties file, and a storage.bin file.
				// If they don't, we will create them.
				for (const dimension of readdirSync(resolve(path, world, 'dimensions'))) {
					// Check if the dimension has a dimension.properties file.
					if (!readdirSync(resolve(path, world, 'dimensions', dimension)).includes('dimension.properties')) {
						// Initialize the default dimension properties.
						// And update the default dimension properties with the dimension identifier.
						const properties = DEFAULT_DIMENSION_PROPERTIES;
						properties.identifier = dimension.replace('-', ':');

						// Write the default dimension properties to the file.
						writeFileSync(
							resolve(path, world, 'dimensions', dimension, 'dimension.properties'),
							stringify(properties, { indent: 2 }),
						);
					}

					// Check if the dimension has a storage.bin file.
					if (!readdirSync(resolve(path, world, 'dimensions', dimension)).includes('storage.bin')) {
						// Create the storage.bin file.
						writeFileSync(resolve(path, world, 'dimensions', dimension, 'storage.bin'), Buffer.alloc(0));
					}
				}

				// Create the filesystem provider.
				const filesystem = new Filesystem(serenity, resolve(path, world));

				// Create the world instance, and add it to the serenity instance.
				const newWorld = new World(serenity, filesystem);
				serenity.worlds.set(newWorld.properties.name, newWorld);

				// Read the world dimensions properties, and register them.
				for (const properties of filesystem.readDimensionsProperties()) {
					// TODO: Update the dimension properties with the correct generator.
					newWorld.registerDimension(Dimension.resolveType(properties.type), properties, BetterFlat.BasicFlat());
				}

				// Load the chunks for each dimension.
				for (const [, dimension] of newWorld.dimensions) {
					const chunks = filesystem.readChunks(dimension);
					for (const chunk of chunks) {
						dimension.chunks.set(chunk.getHash(), chunk);
					}

					Filesystem.logger.success(
						`Loaded ${chunks.length} chunks for dimension "${dimension.properties.identifier}" in world "${newWorld.properties.name}."`,
					);
				}
			}
		} catch {
			this.logger.error(`Failed to initialize the filesystem provider at "${path}"`);
			serenity.stop();
		}
	}
}

export { Filesystem };
