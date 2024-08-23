import { resolve } from "node:path";

import {
	Chunk,
	type Dimension,
	Entity,
	SubChunk,
	type TerrainGenerator,
	World,
	type WorldConfig,
	type WorldDimensionConfig,
	WorldProvider
} from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { ActorData, ChunkCoords, DimensionType } from "@serenityjs/protocol";
import { Leveldb } from "@serenityjs/leveldb";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import type { EntityIdentifier } from "@serenityjs/entity";

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
	public readonly dimensions: Array<WorldDimensionConfig>;

	/**
	 * The chunks stored in the provider.
	 */
	public readonly chunks: Map<Dimension, Map<bigint, Chunk>> = new Map();

	public constructor(path: string, dimensions: Array<WorldDimensionConfig>) {
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
		if (!this.chunks.has(dimension))
			this.chunks.set(dimension, new Map<bigint, Chunk>());

		// Get the chunks map for the dimension index.
		const chunks = this.chunks.get(dimension);

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

			// Load the entities for the chunk.
			const entities = this.readEntities(chunk, dimension);
			for (const entity of entities) {
				dimension.spawnEntity(entity, entity.position);
			}

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

	public readEntities(chunk: Chunk, dimension: Dimension): Array<Entity> {
		try {
			// Get the dimension index from the dimensions array.
			const index = this.dimensions.findIndex(
				(x) => x.identifier === dimension.identifier
			);

			// Check if the dimension index is invalid.
			if (index === -1)
				throw new Error(
					`Dimension index "${dimension.identifier}" was not found for world.`
				);

			// Create a key for the actor list.
			const key = LevelDBProvider.buildActorListKey(chunk.x, chunk.z, index);

			// Get the actor list from the database
			// And create a new BinaryStream instance.
			const stream = new BinaryStream(this.db.get(key));

			// Prepare an array of unique identifiers.
			// And read the unique identifiers from the stream.
			const uniqueIds = new Array<bigint>();
			do {
				uniqueIds.push(stream.readInt64(Endianness.Little));
			} while (!stream.cursorAtEnd());

			// Iterate through the unique identifiers.
			// And read the actor data from the database.
			const entities = new Array<Entity>();
			for (const uniqueId of uniqueIds) {
				// Create a key for the actor data.
				const key = LevelDBProvider.buildActorDataKey(uniqueId);

				// Get the actor data from the database.
				const stream = new BinaryStream(this.db.get(key));
				const data = ActorData.read(stream);

				// Get the entity identifier from the actor data.
				const identifier = data.identifier as EntityIdentifier;

				// Create a new entity instance.
				const entity = new Entity(identifier, dimension, uniqueId);

				// Set the entity position.
				entity.position.x = data.position.x;
				entity.position.y = data.position.y;
				entity.position.z = data.position.z;

				entity.rotation.yaw = data.rotation.yaw;
				entity.rotation.pitch = data.rotation.pitch;
				entity.rotation.headYaw = data.rotation.headYaw;

				// Push the entity to the entities array.
				entities.push(entity);
			}

			// Return the entities array.
			return entities;
		} catch {
			// Return an empty array if no entities were found.
			return [];
		}
	}

	public writeChunk(chunk: Chunk, dimension: Dimension): void {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensions.findIndex(
			(x) => x.identifier === dimension.identifier
		);

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

	public writeEntities(
		entities: Array<Entity>,
		chunk: Chunk,
		dimension: Dimension
	): void {
		// Get the dimension index from the dimensions array.
		const index = this.dimensions.findIndex(
			(x) => x.identifier === dimension.identifier
		);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Create a key for the actor list.
		const key = LevelDBProvider.buildActorListKey(chunk.x, chunk.z, index);

		// Create a new BinaryStream instance.
		const listStream = new BinaryStream();

		// Iterate through the entities and write them to the database.
		for (const entity of entities) {
			// Push the unique identifier to the unique identifiers array.
			listStream.writeInt64(entity.unique, Endianness.Little);

			// Create a key for the actor data.
			const key = LevelDBProvider.buildActorDataKey(entity.unique);

			// Create a new BinaryStream instance.
			const dataStream = new BinaryStream();

			// Get the actor data from the entity.
			const actorData = Entity.toActorData(entity);

			// Write the actor data to the stream.
			ActorData.write(dataStream, actorData);

			// Write the actor data to the database.
			this.db.put(key, dataStream.getBuffer());
		}

		// Write the actor list to the database.
		this.db.put(key, listStream.getBuffer());
	}

	public save(shutdown?: boolean): void {
		// Iterate through the chunks and write them to the database.
		for (const [dimension, chunks] of this.chunks) {
			// Iterate through the chunks and write them to the database
			for (const [, chunk] of chunks) {
				// Get all the entities in the chunk.
				const entities = dimension.getEntitiesInChunk(chunk, false);

				// Write the entities if there are any.
				if (entities.length > 0) this.writeEntities(entities, chunk, dimension);

				// Write the chunk to the database.
				this.writeChunk(chunk, dimension);
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
		config: WorldConfig,
		path: string,
		generators: Array<typeof TerrainGenerator>
	): World {
		// Read the level name from the levelname.txt file.
		const { identifier, dimensions } = config;

		// Create a new provider instance.
		const provider = new this(path, dimensions);

		// Create a new world instance with the provider.
		const world = new World(identifier, provider);

		// Iterate through the dimensions and create them.
		for (const entry of dimensions) {
			// Seperate the dimension properties.
			const { identifier, type, generator, viewDistance, simulationDistance } =
				entry;

			// Check if the dimension identifier is valid. (no spaces, no special characters)
			if (!/^[\d_a-z]+$/.test(identifier)) {
				throw new Error(
					`Invalid dimension identifier: "${identifier}"\nDimension identifiers must only contain lowercase letters, numbers, and underscores.`
				);
			}

			// Find the generator for the dimension.
			const dgenerator = generators.find((x) => x.identifier === generator);

			// Check if the generator exists.
			if (!dgenerator)
				throw new Error(
					`Unknown generator "${generator}" for dimension "${identifier}" in world "${identifier}"\nMake sure the provided generator is valid and registered.`
				);

			// Parse the dimension type.
			const dim =
				type === "overworld"
					? DimensionType.Overworld
					: type === "nether"
						? DimensionType.Nether
						: DimensionType.End;

			// Create a new instance of the generator & dimension.
			const instance = new dgenerator(config.seed);
			const dimension = world.createDimension(identifier, dim, instance);

			// Set the view distance for the dimension.
			if (viewDistance) dimension.viewDistance = viewDistance;

			// Set the simulation distance for the dimension.
			if (simulationDistance) dimension.simulationDistance = simulationDistance;

			// Get the spawn coordinates for the dimension.
			const [x, y, z] = entry.spawn;

			// Set the spawn coordinates for the dimension.
			dimension.spawn.x = x;
			dimension.spawn.y = y;
			dimension.spawn.z = z;

			// Debug log the dimension creation.
			this.logger.debug(
				`Created dimension "${dimension.identifier}" with generator "${dimension.generator.identifier}" in world "${identifier}"`
			);
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
					// Read the chunk from the provider.
					const chunk = provider.readChunk(sx + x, sz + z, dimension);

					// Serialize the chunk, the will cache the chunk in the provider.
					Chunk.serialize(chunk);

					// Set the dirty flag to false.
					chunk.dirty = false;
				}
			}

			// Log the success message.
			this.logger.success(
				`Successfully pregenerated §c${amount}§r chunks for world §a${world.identifier}§r in dimension §a${dimension.identifier}§r.`
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

	public static buildActorListKey(cx: number, cz: number, index: number) {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		stream.writeInt32(0x64_69_67_70);

		// Write the chunk coordinates to the stream.
		stream.writeInt32(cx, Endianness.Little);
		stream.writeInt32(cz, Endianness.Little);

		// Check if the index is not 0.
		if (index !== 0) stream.writeInt32(index, Endianness.Little);

		// Return the buffer from the stream.
		return stream.getBuffer();
	}

	public static buildActorDataKey(uniqueId: bigint): Buffer {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Write the key symbol to the stream.
		stream.writeBuffer(Buffer.from("actorprefix", "ascii"));

		// Write the unique identifier to the stream.
		stream.writeInt64(uniqueId, Endianness.Little);

		// Return the buffer from the stream.
		return stream.getBuffer();
	}
}

export { LevelDBProvider };
