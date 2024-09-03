import { resolve } from "node:path";

import {
	Block,
	Chunk,
	type Dimension,
	Entity,
	Player,
	SubChunk,
	type TerrainGenerator,
	World,
	type WorldConfig,
	WorldProvider
} from "@serenityjs/world";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { ChunkCoords, DimensionType } from "@serenityjs/protocol";
import { Leveldb } from "@serenityjs/leveldb";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

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
	 * The chunks stored in the provider.
	 */
	public readonly chunks: Map<Dimension, Map<bigint, Chunk>> = new Map();

	public constructor(path: string) {
		super();

		// Open the LevelDB database.
		this.db = Leveldb.open(resolve(path, "db"));
	}

	public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensionIndexOf(dimension);

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

	public readAvailableActors(dimension: Dimension): Array<bigint> {
		// Get the dimension index from the dimensions array.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Try to read the actor list from the database.
		try {
			// Create a key for the actor list.
			const key = LevelDBProvider.buildActorListKey(index);

			// Get the actor list from the database
			// And create a new BinaryStream instance.
			const stream = new BinaryStream(this.db.get(key));

			// Prepare an array of unique identifiers.
			// And read the unique identifiers from the stream.
			const uniqueIds = new Array<bigint>();
			do {
				uniqueIds.push(stream.readInt64(Endianness.Little));
			} while (!stream.cursorAtEnd());

			// Return the unique identifiers array.
			return uniqueIds;
		} catch {
			// Return an empty array if no unique identifiers were found.
			return new Array<bigint>();
		}
	}

	public writeAvailableActors(
		dimension: Dimension,
		uniqueIds: Array<bigint>
	): void {
		// Get the dimension index from the dimensions array.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Create a key for the actor list.
		const key = LevelDBProvider.buildActorListKey(index);

		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Iterate through the unique identifiers and write them to the database.
		for (const uniqueId of uniqueIds) {
			// Write the unique identifier to the stream.
			stream.writeInt64(uniqueId, Endianness.Little);
		}

		// Write the actor list to the database.
		this.db.put(key, stream.getBuffer());
	}

	public readEntity(
		dimension: Dimension,
		entity: bigint | Entity
	): CompoundTag {
		// Get the dimension index from the dimensions array.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Get the entity unique identifier.
		const uniqueId = entity instanceof Entity ? entity.unique : entity;

		// Create a key for the actor data.
		const key = LevelDBProvider.buildActorDataKey(uniqueId);

		// Attempt to get the actor data from the database.
		try {
			// Get the actor data from the database.
			const data = this.db.get(key);

			// Create a new BinaryStream instance.
			const stream = new BinaryStream(data);
			const nbt = CompoundTag.read(stream);

			// Return the entity data.
			return nbt;
		} catch {
			// Return an empty CompoundTag if the entity data was not found.
			return new CompoundTag();
		}
	}

	public writeEntity(entity: Entity): void {
		// Create a key for the actor data.
		const key = LevelDBProvider.buildActorDataKey(entity.unique);

		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Serialize the entity data.
		const nbt = Entity.serialize(entity);
		CompoundTag.write(stream, nbt);

		// Write the actor data to the database.
		this.db.put(key, stream.getBuffer());
	}

	public deleteEntity(entity: Entity): void {
		// Get the dimension index from the dimensions array.
		const dimension = entity.dimension;
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Create a key for the actor data.
		const key = LevelDBProvider.buildActorDataKey(entity.unique);

		// Delete the actor data from the database.
		this.db.delete(key);

		// Get the available actors from the dimension.
		const uniqueIds = this.readAvailableActors(dimension);

		// Filter the unique identifiers.
		const filtered = uniqueIds.filter((x) => x !== entity.unique);

		// Write the available actors to the dimension.
		this.writeAvailableActors(dimension, filtered);
	}

	public writeChunk(chunk: Chunk, dimension: Dimension): void {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensionIndexOf(dimension);

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

	public readBlockData(dimension: Dimension): Array<CompoundTag> {
		// Get the dimension index from the dimensions array.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Attempt to read the block data from the database.
		try {
			// Create a key for the block data.
			const key = LevelDBProvider.buildBlockDataKey(index);

			// Get the block data from the database.
			const data = this.db.get(key);

			// Create a new BinaryStream instance.
			const stream = new BinaryStream(data);

			// Prepare an array of block data.
			const blockData = new Array<CompoundTag>();

			// Read the block data from the stream.
			do {
				blockData.push(CompoundTag.read(stream));
			} while (!stream.cursorAtEnd());

			// Return the block data array.
			return blockData;
		} catch {
			// Return an empty array if no block data was found.
			return new Array<CompoundTag>();
		}
	}

	public writeBlockData(dimension: Dimension, data: Array<CompoundTag>): void {
		// Get the dimension index from the dimensions array.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index is invalid.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension.identifier}" was not found for world.`
			);

		// Create a key for the block data.
		const key = LevelDBProvider.buildBlockDataKey(index);

		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Iterate through the block data and write them to the database.
		for (const nbt of data) {
			// Write the block data to the stream.
			CompoundTag.write(stream, nbt);
		}

		// Write the block data to the database.
		this.db.put(key, stream.getBuffer());
	}

	public hasPlayer(player: string | Player): boolean {
		// Get the player UUID from the player instance.
		const uuid = player instanceof Player ? player.uuid : player;
		const key = `player_server_${uuid}`;

		// Attempt to get the player from the database.
		try {
			// Check if the player exists in the database.
			this.db.get(Buffer.from(key));

			// Return true if the player exists.
			return true;
		} catch {
			// Return false if the player does not exist.
			return false;
		}
	}

	public readPlayer(player: string | Player): CompoundTag {
		// Get the player UUID from the player instance.
		const uuid = player instanceof Player ? player.uuid : player;
		const key = `player_server_${uuid}`;

		// Attempt to get the player from the database.
		const data = this.db.get(Buffer.from(key));

		// Create a new BinaryStream instance.
		const stream = new BinaryStream(data);
		const nbt = CompoundTag.read(stream);

		// Return the player data.
		return nbt;
	}

	public writePlayer(player: Player): void {
		// Get the player UUID from the player instance.
		const uuid = player.uuid;
		const key = `player_server_${uuid}`;

		// Serialize the player data.
		const nbt = Entity.serialize(player);
		nbt.createStringTag("Username", player.username);

		// Create a new BinaryStream instance.
		const stream = new BinaryStream();
		CompoundTag.write(stream, nbt);

		// Write the player data to the database.
		this.db.put(Buffer.from(key), stream.getBuffer());
	}

	public save(shutdown?: boolean): void {
		// Iterate through the chunks and write them to the database.
		for (const [dimension, chunks] of this.chunks) {
			// Iterate through the chunks and write them to the database
			for (const [, chunk] of chunks) {
				// Write the chunk to the database.
				this.writeChunk(chunk, dimension);
			}

			// Get the available actors from the dimension.
			const entities = dimension.getEntities(false);
			const uniqueIds = entities.map((x) => x.unique);

			// Write the available actors to the dimension.
			this.writeAvailableActors(dimension, uniqueIds);

			// Iterate through the entities and write them to the database.
			for (const entity of entities) {
				// Write the entity to the database.
				this.writeEntity(entity);
			}

			// Iterate through the players and write them to the database.
			for (const player of dimension.getPlayers()) {
				// Write the player to the database.
				this.writePlayer(player);
			}

			// Get the block data from the dimension.
			const blockData = [...dimension.blocks.values()].map((x) =>
				Block.serialize(x)
			);

			// Write the block data to the database.
			this.writeBlockData(dimension, blockData);
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
		const provider = new this(path);

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

			// Read the available actors for the dimension.
			const uniqueIds = provider.readAvailableActors(dimension);

			// Iterate through the unique identifiers and spawn the entities.
			for (const uniqueId of uniqueIds) {
				// Read the entity from the provider.
				const entity = provider.readEntity(dimension, uniqueId);

				// Deserialize the entity and add it to the dimension.
				const instance = Entity.deserialize(entity, dimension);

				// Spawn the entity in the dimension.
				instance.spawn();
			}

			// Read the block data for the dimension.
			const blockData = provider.readBlockData(dimension);

			// Iterate through the block data and deserialize the blocks.
			for (const nbt of blockData) {
				// Deserialize the block from the nbt.
				const block = Block.deserialize(dimension, nbt);

				// Add the block to the dimension.
				dimension.blocks.set(block.position, block);
			}

			// Debug log the dimension creation.
			this.logger.debug(
				`Created dimension "${dimension.identifier}" with generator "${dimension.generator.identifier}" in world "${world.identifier}"`
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

	public static buildActorListKey(index: number) {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Write the key symbol to the stream
		stream.writeInt32(0x64_69_67_70);

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

	public static buildBlockDataKey(index: number): Buffer {
		// Create a new BinaryStream instance.
		const stream = new BinaryStream();

		// Write the key symbol to the stream.
		stream.writeInt32(0x31);

		// Check if the index is not 0.
		if (index !== 0) stream.writeInt32(index, Endianness.Little);

		// Return the buffer from the stream.
		return stream.getBuffer();
	}
}

export { LevelDBProvider };
