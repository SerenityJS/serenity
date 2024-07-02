import { basename, join } from "node:path";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

import { ChunkCoords, DimensionType } from "@serenityjs/protocol";
import {
	Chunk,
	type TerrainGenerator,
	WorldProvider,
	type Dimension,
	World
} from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { DEFAULT_WORLD_PROPERTIES, Properties } from "../properties";
import { exists } from "../utils/exists";

interface DefaultWorldProperties {
	"world-name": string;
	"world-seed": number;
	"view-distance": number;
	"simulation-distance": number;
}

/**
 * The filesystem provider is a basic provider that stores chunks in binary files.
 * This provider does load and save chunks from disk, it is used for production.
 */
class FileSystemProvider extends WorldProvider {
	public static readonly identifier = "filesystem";

	public static readonly logger = new Logger("FileSystem", LoggerColors.Blue);

	/**
	 * The chunks stored in the provider.
	 */
	public readonly chunks: Map<string, Map<bigint, Chunk>> = new Map();

	/**
	 * The path to the world.
	 */
	public readonly path: string;

	/**
	 * The world properties.
	 */
	public readonly properties: Properties<DefaultWorldProperties>;

	public constructor(
		path: string,
		properties: Properties<DefaultWorldProperties>
	) {
		super();
		this.path = path;
		this.properties = properties;
	}

	public static initialize(
		path: string,
		generators: Array<typeof TerrainGenerator>
	): World {
		// Create the world properties.
		const properties = new Properties<DefaultWorldProperties>(
			join(path, "world.properties"),
			DEFAULT_WORLD_PROPERTIES
		);

		// Check if the "dims" directory exists.
		if (!exists(join(path, "dims"))) {
			// Create the "dims" directory.
			mkdirSync(join(path, "dims"));
		}

		// Get the world name.
		const name = properties.getValue("world-name");

		// Create the File System Provider.
		const provider = new FileSystemProvider(path, properties);

		// Create the world.
		const world = new World(name, provider);

		// Get all the directories in the "dims" directory.
		const directories = readdirSync(join(path, "dims"), {
			withFileTypes: true
		}).filter((dirent) => dirent.isDirectory());

		// Check if the "dims" directory is empty.
		if (directories.length === 0) {
			// Create the "overworld" directory in the "dims" directory.
			mkdirSync(join(path, "dims", "overworld"));

			// Create the ".generator" file in the "overworld" directory.
			// This file is used to determine the generator for the dimension.
			writeFileSync(join(path, "dims", "overworld", ".generator"), "superflat");

			// Push the "overworld" directory to the directories array.
			directories.push(
				...readdirSync(join(path, "dims"), { withFileTypes: true }).filter(
					(dirent) => dirent.isDirectory()
				)
			);
		}

		// Loop through the directories in the "dims" directory.
		for (const directory of directories) {
			// Check if the directory contains a ".generator" file.
			// If not, then skip the directory.
			if (!exists(join(path, "dims", directory.name, ".generator"))) {
				continue;
			}

			// Check if the directory contains a ".type" file.
			// If not, then create the ".type" file.
			if (!exists(join(path, "dims", directory.name, ".type"))) {
				writeFileSync(join(path, "dims", directory.name, ".type"), "overworld");
			}

			// Check if the directory contains a "chunks" directory.
			// If not, then create the "chunks" directory.
			if (!exists(join(path, "dims", directory.name, "chunks"))) {
				mkdirSync(join(path, "dims", directory.name, "chunks"));
			}

			// Read the ".generator" file.
			const entry = readFileSync(
				join(path, "dims", directory.name, ".generator"),
				"utf8"
			);

			// Get the generator from the generators array.
			const generator = generators.find((x) => x.identifier === entry);

			// Check if the generator is not undefined.
			if (!generator) throw new Error(`Unknown generator: ${entry}`);

			// Read the ".type" file.
			const type = readFileSync(
				join(path, "dims", directory.name, ".type"),
				"utf8"
			);

			// Get the name of the dimension.
			const name = basename(directory.name);

			// Create the generator instance.
			const instance = new generator(properties.getValue("world-seed"));

			// Create a new dimension for the world.
			const dimension = world.createDimension(
				name,
				type === "end"
					? DimensionType.End
					: type === "nether"
						? DimensionType.Nether
						: DimensionType.Overworld,
				instance
			);

			// Set the view distance & simulation distance.
			dimension.viewDistance = properties.getValue("view-distance");
			dimension.simulationDistance = properties.getValue("simulation-distance");
		}

		// Pregenerate the spawn chunks for each dimension.
		for (const dimension of world.dimensions.values()) {
			// Get the spawn position of the dimension.
			const sx = dimension.spawn.x >> 4;
			const sz = dimension.spawn.z >> 4;

			// Get the view distance of the dimension.
			const viewDistance = dimension.viewDistance >> 4;

			// Calculate the amount of chunks to pregenerate.
			const amount = (viewDistance * 2 + 1) ** 2;

			// Log the amount of chunks to pregenerate.
			this.logger.info(
				`Preparing §c${amount}§r chunks for world §a${world.identifier}§r in dimension §a${dimension.identifier}§r.`
			);

			// Iterate over the chunks to pregenerate.
			for (let x = -viewDistance; x <= viewDistance; x++) {
				for (let z = -viewDistance; z <= viewDistance; z++) {
					const chunk = provider.readChunk(sx + x, sz + z, dimension);

					// Set the dirty flag to false.
					chunk.dirty = false;
				}
			}

			// Log the success message.
			this.logger.success(
				`Successfully pregenerated §c${amount}§r chunks for world §a${world.identifier}§r in dimension §a${dimension.identifier}§r.`
			);
		}

		// Return the world.
		return world;
	}

	public save(): void {
		for (const [identifier, dimension] of this.chunks) {
			// Get all the dirty chunks.
			const chunks = [...dimension.values()].filter((chunk) => chunk.dirty);

			// Loop through the dirty chunks.
			for (const chunk of chunks) {
				this.writeChunk(chunk, identifier);

				// Set the dirty flag to false.
				chunk.dirty = false;
			}

			// Delete the chunks from the map.
			this.chunks.delete(identifier);
		}
	}

	public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
		// Check if the chunks contain the dimension.
		if (!this.chunks.has(dimension.identifier)) {
			this.chunks.set(dimension.identifier, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(dimension.identifier) as Map<bigint, Chunk>;

		// Get the chunk hash.
		const hash = ChunkCoords.hash({ x: cx, z: cz });

		// Check if the chunks exist.
		const exist = exists(
			join(this.path, "dims", dimension.identifier, "chunks", `${cx}.${cz}.bin`)
		);

		if (chunks.has(hash)) {
			return chunks.get(hash) as Chunk;
		} else if (exist) {
			// Read the chunk from the file system.
			const buffer = readFileSync(
				join(
					this.path,
					"dims",
					dimension.identifier,
					"chunks",
					`${cx}.${cz}.bin`
				)
			);

			// Deserialize the chunk.
			const chunk = Chunk.deserialize(dimension.type, cx, cz, buffer, true);

			// Set the chunk in the chunks map.
			chunks.set(hash, chunk);

			// Deserialize the chunk.
			return chunk;
		} else {
			// Create a new chunk.
			const chunk = dimension.generator.apply(cx, cz, dimension.type);

			// Set the chunk in the chunks map.
			chunks.set(hash, chunk);

			// Return the chunk.
			return chunk;
		}
	}

	public writeChunk(chunk: Chunk, dimension: Dimension | string): void {
		// Get the dimension identifier.
		const identifier =
			typeof dimension === "string" ? dimension : dimension.identifier;

		// Check if the chunks contain the dimension.
		if (!this.chunks.has(identifier)) {
			this.chunks.set(identifier, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(identifier) as Map<bigint, Chunk>;

		// Get the chunk hash.
		const hash = ChunkCoords.hash({ x: chunk.x, z: chunk.z });

		// Set the chunk in the chunks map.
		chunks.set(hash, chunk);

		// Write the chunk to the file system.
		writeFileSync(
			join(
				this.path,
				"dims",
				identifier,
				"chunks",
				`${chunk.x}.${chunk.z}.bin`
			),
			Chunk.serialize(chunk, true)
		);
	}
}

export { FileSystemProvider };
