import { join, resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import {
	Chunk,
	type Dimension,
	SubChunk,
	type TerrainGenerator,
	World,
	WorldProvider
} from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { ChunkCoords, DimensionType } from "@serenityjs/protocol";
import { Leveldb } from "@serenityjs/leveldb";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { exists } from "../utils/exists";

interface LevelDBDimension {
	identifier: string;
	type: string;
	generator: string;
	viewDistance?: number;
	simulationDistance?: number;
}

class LevelDBProvider extends WorldProvider {
	/**
	 * The identifier of the LevelDB provider.
	 */
	public static readonly identifier = "leveldb";

	/**
	 * The logger instance for the LevelDB provider.
	 */
	public static readonly logger = new Logger("LevelDB", LoggerColors.Green);

	/**
	 * The LevelDB database instance.
	 */
	public readonly db: Leveldb;

	/**
	 * The dimensions registered for the world.
	 */
	public readonly dimensions: Array<LevelDBDimension>;

	/**
	 * The chunks stored in the provider.
	 */
	public readonly chunks: Map<number, Map<bigint, Chunk>> = new Map();

	public constructor(path: string, dimensions: Array<LevelDBDimension>) {
		super();

		// Open the LevelDB database.
		this.db = Leveldb.open(resolve(path, "db"));
		this.dimensions = dimensions;
	}

	public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensions.findIndex(
			(x) => x.identifier === dimension.identifier
		);

		// Check if the dimension index was found.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Check if the chunks map has the index.
		if (!this.chunks.has(index))
			this.chunks.set(index, new Map<bigint, Chunk>());

		// Get the chunks map for the dimension index.
		const chunks = this.chunks.get(index);

		// Check if no chunks were found.
		if (!chunks)
			throw new Error(
				`Failed to get chunks for dimension "${dimension.identifier}" with index "${index}"`
			);

		// Hash the chunk coordinates.
		const hash = ChunkCoords.hash({ x: cx, z: cz });

		// Check if the chunk exists in the chunks map.
		if (chunks.has(hash)) {
			// Return the chunk from the chunks cache.
			return chunks.get(hash) as Chunk;
		} else if (this.chunkExists(cx, cz, index)) {
			// Create an array of subchunks.
			const subchunks = new Array<SubChunk>();

			// Iterate through the subchunks and read them from the database.
			// TODO: Dimensions can have a data driven min and max subchunk value, we should use that.
			for (let cy = -4; cy < 16; cy++) {
				// Read and push the subchunk to the subchunks array.
				subchunks.push(this.readSubchunk(cx, cy, cz, index));
			}

			// Create a new chunk instance.
			const chunk = new Chunk(cx, cz, dimension.type, subchunks);

			// Set the chunk in the chunks map.
			chunks.set(hash, chunk);

			// Return the chunk.
			return chunk;
		} else {
			// Generate a new chunk using the dimension generator.
			const chunk = dimension.generator.apply(cx, cz, dimension.type);

			// Set the chunk in the chunks map.
			chunks.set(hash, chunk);

			// Return the chunk.
			return chunk;
		}
	}

	/**
	 * Read a subchunk from the database.
	 * @param cx The chunk X coordinate.
	 * @param cy The subchunk Y coordinate.
	 * @param cz The chunk Z coordinate.
	 * @param index The dimension index.
	 * @returns The subchunk read from the database.
	 */
	public readSubchunk(
		cx: number,
		cy: number,
		cz: number,
		index: number
	): SubChunk {
		try {
			const key = LevelDBProvider.buildSubchunkKey(cx, cy, cz, index);

			const data = this.db.get(key);

			const sub = SubChunk.from(data, true);
			sub.index = cy;

			return sub;
		} catch {
			const subchunk = new SubChunk();
			subchunk.index = cy;

			return subchunk;
		}
	}

	public writeChunk(chunk: Chunk, dimension: string): void {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensions.findIndex((x) => x.identifier === dimension);

		// Check if the dimension index was found.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension}" was not found for world.`
			);

		// Check if the chunk is empty.
		if (chunk.isEmpty() || !chunk.dirty) return;

		// Write the chunk version, in this case will be 40
		this.writeChunkVersion(chunk.x, chunk.z, index, 40);

		// Iterate through the chunks and write them to the database.
		// TODO: Dimensions can have a data driven min and max subchunk value, we should use that.
		for (let cy = -4; cy < 16; cy++) {
			// Get the subchunk from the chunk.
			const subchunk = chunk.getSubChunk(cy + 4);

			// Check if the subchunk is empty.
			if (!subchunk || subchunk.isEmpty()) continue;

			// Write the subchunk to the database.
			this.writeSubchunk(subchunk, chunk.x, cy, chunk.z, index);
		}

		// Set the chunk as not dirty.
		chunk.dirty = false;
	}

	public writeSubchunk(
		subchunk: SubChunk,
		cx: number,
		cy: number,
		cz: number,
		index: number
	): void {
		// Create a key for the subchunk.
		const key = LevelDBProvider.buildSubchunkKey(cx, cy, cz, index);

		// Set the subchunk index.
		subchunk.index = cy;

		// Serialize the subchunk to a buffer
		const stream = new BinaryStream();
		SubChunk.serialize(subchunk, stream, true);

		// Write the subchunk to the database
		this.db.put(key, stream.getBuffer());
	}

	public save(shutdown?: boolean): void {
		// Iterate through the chunks and write them to the database.
		for (const [index, chunks] of this.chunks) {
			// Iterate through the chunks and write them to the database
			for (const [, chunk] of chunks) {
				const dimension = this.dimensions[index];

				// Check if the dimension was found
				if (!dimension)
					throw new Error(`Failed to get dimensions for index "${index}"`);

				// Write the chunk to the database.
				this.writeChunk(chunk, dimension.identifier);
			}
		}

		// If the provider is shutting down, close the database connection.
		if (shutdown) this.db.close();
	}

	/**
	 * Check if a chunk exists in the database.
	 * @param cx The chunk X coordinate.
	 * @param cz The chunk Z coordinate.
	 * @param index The dimension index.
	 * @returns True if the chunk exists, false otherwise.
	 */
	public chunkExists(cx: number, cz: number, index: number): boolean {
		try {
			// Create a key for the chunk version.
			const key = LevelDBProvider.buildChunkVersionKey(cx, cz, index);

			// Check if the key exists in the database.
			const data = this.db.get(key);
			if (data) return true;

			// Return false if the chunk does not exist.
			return false;
		} catch {
			return false;
		}
	}

	/**
	 * Write the chunk version to the database.
	 * @param cx The chunk X coordinate.
	 * @param cz The chunk Z coordinate.
	 * @param index The dimension index.
	 * @param version The chunk version.
	 */
	public writeChunkVersion(
		cx: number,
		cz: number,
		index: number,
		version: number
	): void {
		// Create a key for the chunk version
		const key = LevelDBProvider.buildChunkVersionKey(cx, cz, index);

		// Write the chunk version to the database.
		this.db.put(key, Buffer.from([version]));
	}

	public static initialize(
		path: string,
		generators: Array<typeof TerrainGenerator>
	): World {
		// Check if the levelname.txt file exists.
		if (!exists(join(path, "levelname.txt"))) {
			// Write the default level name to the levelname.txt file.
			writeFileSync(join(path, "levelname.txt"), "default");
		}

		// Check if a .dimensions file exists.
		// This is a SerenityJS specific file that stores will store the dimensions of the world.
		if (!exists(join(path, ".dimensions"))) {
			// The default dimension for a world.
			const defaultDimension = {
				identifier: "overworld",
				type: "overworld",
				generator: "superflat"
			};

			// Write the default dimensions to the .dimensions file.
			writeFileSync(
				join(path, ".dimensions"),
				JSON.stringify([defaultDimension], null, 2)
			);
		}

		// Read the level name from the levelname.txt file.
		const identifier = readFileSync(join(path, "levelname.txt"), "utf8").trim();

		// Read the dimensions from the .dimensions file.
		const dimensions: Array<LevelDBDimension> = JSON.parse(
			readFileSync(join(path, ".dimensions"), "utf8").trim()
		);

		// Create a new provider instance.
		const provider = new this(path, dimensions);

		// Create a new world instance with the provider.
		const world = new World(identifier, provider);

		for (const dimension of dimensions) {
			// Check if the dimension identifier is valid. (no spaces, no special characters)
			if (!/^[\d_a-z]+$/.test(dimension.identifier)) {
				throw new Error(
					`Invalid dimension identifier: "${dimension.identifier}"\nDimension identifiers must only contain lowercase letters, numbers, and underscores.`
				);
			}

			// Find the generator for the dimension.
			const generator = generators.find(
				(generator) => generator.identifier === dimension.generator
			);

			// Check if the generator exists.
			if (!generator)
				throw new Error(
					`Unknown generator "${dimension.generator}" for dimension "${dimension.identifier}" in world "${identifier}"\nMake sure the provided generator is valid and registered.`
				);

			// Parse the dimension type.
			const type =
				dimension.type === "overworld"
					? DimensionType.Overworld
					: dimension.type === "nether"
						? DimensionType.Nether
						: DimensionType.End;

			// TODO: Get the seed from the level.dat file.
			const instance = world.createDimension(
				dimension.identifier,
				type,
				new generator(0)
			);

			// Set the view distance for the dimension.
			if (dimension.viewDistance)
				instance.viewDistance = dimension.viewDistance;

			// Set the simulation distance for the dimension.
			if (dimension.simulationDistance)
				instance.simulationDistance = dimension.simulationDistance;

			// Debug log the dimension creation.
			this.logger.debug(
				`Created dimension "${dimension.identifier}" with generator "${dimension.generator}" in world "${identifier}"`
			);
		}

		return world;
	}

	/**
	 * Build a chunk version key for the database.
	 * @param cx The chunk X coordinate.
	 * @param cz The chunk Z coordinate.
	 * @param index The dimension index.
	 * @returns The buffer key for the chunk version
	 */
	public static buildChunkVersionKey(
		cx: number,
		cz: number,
		index: number
	): Buffer {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Write the chunk coordinates to the stream.
		stream.writeInt32(cx, Endianness.Little);
		stream.writeInt32(cz, Endianness.Little);

		// Check if the index is not 0.
		if (index !== 0) {
			stream.writeInt32(index, Endianness.Little);
		}

		// Write the chunk version byte to the stream.
		stream.writeByte(0x2c);

		// Return the buffer from the stream
		return stream.getBuffer();
	}

	/**
	 * Build a subchunk key for the database.
	 * @param cx The chunk X coordinate.
	 * @param cy The subchunk Y coordinate.
	 * @param cz The chunk Z coordinate.
	 * @param index The dimension index.
	 * @returns The buffer key for the subchunk
	 */
	public static buildSubchunkKey(
		cx: number,
		cy: number,
		cz: number,
		index: number
	): Buffer {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Write the chunk coordinates to the stream.
		stream.writeInt32(cx, Endianness.Little);
		stream.writeInt32(cz, Endianness.Little);

		// Check if the index is not 0.
		if (index !== 0) stream.writeInt32(index, Endianness.Little);

		// Write the query key to the stream.
		stream.writeByte(0x2f);

		// Write the subchunk index to the stream.
		stream.writeByte(cy);

		// Return the buffer from the stream.
		return stream.getBuffer();
	}
}

export { LevelDBProvider };
