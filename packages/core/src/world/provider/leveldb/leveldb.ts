import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve } from "node:path";

import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { Leveldb } from "@serenityjs/leveldb";
import { DimensionType } from "@serenityjs/protocol";
import { CompoundTag, LongTag } from "@serenityjs/nbt";

import { BiomeStorage, Chunk, SubChunk } from "../../chunk";
import { Dimension } from "../../dimension";
import { Serenity } from "../../../serenity";
import { WorldProviderProperties } from "../../../types";
import { World } from "../../world";
import { WorldInitializeSignal } from "../../../events";
import { Structure } from "../../structure";
import { BlockLevelStorage } from "../../../block";
import { WorldProvider } from "../provider";
import { DimensionProperties, WorldProperties } from "../../types";

import { LevelDBKeyBuilder } from "./key-builder";

class LevelDBProvider extends WorldProvider {
  public static readonly identifier: string = "leveldb";

  /**
   * The chunk version written by the provider.
   */
  private static readonly CHUNK_VERSION: number = 40;

  /**
   * Cached buffer for chunk version 40.
   *
   * This avoids re-allocating `Buffer.from([40])` for every chunk save.
   */
  private static readonly CHUNK_VERSION_BUFFER: Buffer = Buffer.from([
    LevelDBProvider.CHUNK_VERSION
  ]);

  /**
   * A reusable empty heightmap buffer (Bedrock format uses 512 bytes).
   *
   * This avoids allocating a new 512-byte buffer every time biomes are written.
   */
  private static readonly EMPTY_HEIGHTMAP: Buffer = Buffer.alloc(512);

  /**
   * Player key prefix.
   *
   * The provider stores players using the standard bedrock key format.
   */
  private static readonly PLAYER_PREFIX: string = "player_server_";

  /**
   * How often (in items) we yield back to the event loop while reading.
   *
   * Reading a chunk can involve many synchronous DB reads and heavy NBT parsing.
   * Yielding prevents the server from freezing the main thread for too long.
   */
  private static readonly READ_YIELD_MASK: number = 15; // yield every 16 items

  /**
   * The path of the provider.
   */
  public readonly path: string;

  /**
   * The database instance for the provider.
   */
  public readonly db: Leveldb;

  /**
   * The loaded chunks in the provider.
   *
   * Keyed by: Dimension -> (Chunk hash -> Chunk)
   */
  public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

  /**
   * In-flight chunk reads to prevent duplicate reads/generations for the same chunk.
   *
   * Keyed by: Dimension -> (Chunk hash -> Promise<Chunk>)
   */
  private readonly inflight = new Map<Dimension, Map<bigint, Promise<Chunk>>>();

  /**
   * Tracks whether a cached chunk instance is fully loaded (ready).
   *
   * IMPORTANT:
   * We cache a placeholder immediately so "chunk exists" is true during async yields.
   * Without a readiness flag, another reader can grab the placeholder early and see
   * missing subchunks.
   */
  private readonly chunkReady = new WeakMap<Chunk, boolean>();

  public constructor(path: string) {
    super();

    // Store the provider path.
    this.path = path;

    // Open the LevelDB database at `<path>/db`.
    this.db = Leveldb.open(resolve(path, "db"));
  }

  /**
   * Yields control back to the event loop.
   *
   * This is used to prevent long synchronous parsing from blocking the server tick loop.
   */
  private yieldToMain(): Promise<void> {
    return new Promise((resolve) => setImmediate(resolve));
  }

  /**
   * Attempts to read a value from the database without throwing.
   *
   * @param key The DB key to read.
   * @returns The value buffer, or null if missing.
   */
  private tryGet(key: Buffer): Buffer | null {
    try {
      const value = this.db.get(key) as unknown as Buffer | undefined | null;
      return value ? value : null;
    } catch {
      return null;
    }
  }

  /**
   * Reads a value from the database and returns a detached copy.
   *
   * Some native LevelDB bindings return Buffers backed by pooled / reused native
   * memory. When yielding, other reads can overwrite that backing memory, causing
   * previously "loaded" data to become corrupted or appear missing.
   *
   * Copying here ensures the returned Buffer is stable for the lifetime of parsing.
   *
   * @param key The DB key to read.
   * @returns A copied buffer, or null if missing.
   */
  private safeGet(key: Buffer): Buffer | null {
    const buffer = this.tryGet(key);
    return buffer ? Buffer.from(buffer) : null;
  }

  /**
   * Writes many entries in the most efficient way the DB supports.
   *
   * If the LevelDB wrapper supports `batch`, we use it to reduce overhead and
   * improve write throughput. Otherwise we fall back to `put` per entry.
   *
   * @param entries The set of key/value entries to write.
   */
  private putMany(entries: Array<[Buffer, Buffer]>): void {
    if (entries.length === 0) return;

    const db = this.db as unknown as {
      batch?: (ops: Array<{ type: "put"; key: Buffer; value: Buffer }>) => void;
    };

    if (typeof db.batch === "function") {
      try {
        db.batch(
          entries.map(([key, value]) => ({
            type: "put" as const,
            key,
            value
          }))
        );
        return;
      } catch {
        // Fall back below
      }
    }

    for (const [key, value] of entries) this.db.put(key, value);
  }

  /**
   * Gets (or creates) the chunk cache map for a dimension.
   */
  private getDimensionChunkCache(dimension: Dimension): Map<bigint, Chunk> {
    let cache = this.chunks.get(dimension);
    if (!cache) {
      cache = new Map();
      this.chunks.set(dimension, cache);
    }
    return cache;
  }

  /**
   * Gets (or creates) the in-flight read map for a dimension.
   */
  private getDimensionInflight(
    dimension: Dimension
  ): Map<bigint, Promise<Chunk>> {
    let map = this.inflight.get(dimension);
    if (!map) {
      map = new Map();
      this.inflight.set(dimension, map);
    }
    return map;
  }

  public async onShutdown(): Promise<void> {
    const dimensions: Array<DimensionProperties> = [];

    for (const [, dimension] of this.world.dimensions) {
      dimensions.push(dimension.properties);

      if (dimension.generator.worker) {
        dimension.generator.worker.terminate();
      }
    }

    const properties = this.world.properties;
    properties.dimensions = dimensions;

    writeFileSync(
      resolve(this.path, "properties.json"),
      JSON.stringify(properties, null, 2)
    );

    // Await saving the world.
    await this.onSave();

    // Close the database.
    this.db.close();
  }

  public async onStartup(): Promise<void> {
    const schedule = this.world.schedule(80);

    const pregenerate = async () => {
      for (const [, dimension] of this.world.dimensions) {
        // Fetch pregeneration options.
        const pregeneration = dimension.properties.chunkPregeneration ?? [];

        // Prepare a var to track pregenerated chunks.
        let chunkCount = 0;

        // Iterate through each pregeneration option.
        for (const { start, end, memoryLock } of pregeneration) {
          // Mask to chunk coordinates.
          const sx = start[0] >> 4;
          const sz = start[1] >> 4;
          const ex = end[0] >> 4;
          const ez = end[1] >> 4;

          // Iterate through each chunk in the area.
          for (let x = sx; x <= ex; x++) {
            for (let z = sz; z <= ez; z++) {
              // Create a new chunk and read it.
              let chunk = new Chunk(x, z, dimension.type);
              chunk = await this.readChunk(chunk, dimension);

              // Memory lock the chunk if needed.
              chunk.memoryLock = memoryLock ?? false;

              // Increment the pregenerated chunk count.
              chunkCount++;

              // Check if we need to yield.
              if ((chunkCount & LevelDBProvider.READ_YIELD_MASK) === 0) {
                await this.yieldToMain();
              }
            }
          }
        }

        const entityCount = dimension.entities.size;
        const blockCount = dimension.blocks.size;

        this.world.logger.info(
          `Successfully pre-generated §u${chunkCount}§r chunks for dimension §u${dimension.identifier}§r which contains §u${entityCount}§r entities and §u${blockCount}§r blocks.`
        );
      }
    };

    schedule.on(async () => {
      await pregenerate();
    });
  }

  public async onSave(): Promise<void> {
    // Iterate through each dimension and its chunks.
    for (const [dimension, chunks] of this.chunks) {
      for (const chunk of chunks.values()) {
        // Write the chunk.
        await this.writeChunk(chunk, dimension);
      }
    }

    // Ensure all data is flushed to disk.
    return this.db.flush();
  }

  public readBuffer(key: string | Buffer): Buffer {
    const bufferKey = Buffer.isBuffer(key) ? key : Buffer.from(key);
    return this.db.get(bufferKey);
  }

  public writeBuffer(key: string | Buffer, value: Buffer): void {
    const bufferKey = Buffer.isBuffer(key) ? key : Buffer.from(key);
    this.db.put(bufferKey, value);
  }

  /**
   * IMPORTANT GUARANTEE:
   * This Promise only resolves once we have attempted to read ALL subchunk indices
   * (0..MAX_SUB_CHUNKS-1). No caller will receive a partially-loaded placeholder
   * unless they bypass `readChunk()` and pull directly from `this.chunks`.
   */
  public async readChunk(chunk: Chunk, dimension: Dimension): Promise<Chunk> {
    const cache = this.getDimensionChunkCache(dimension);
    const inflight = this.getDimensionInflight(dimension);

    // ✅ Always prefer the in-flight promise first.
    const existing = inflight.get(chunk.hash);
    if (existing) return existing;

    // ✅ If cached and ready, return immediately.
    const cached = cache.get(chunk.hash);
    if (cached) {
      if (this.chunkReady.get(cached) === true) return cached;

      // Cached but not ready => should be loading. If inflight is missing for
      // any reason, we'll continue and load into the cached instance.
      chunk = cached;
    }

    // Insert placeholder if needed and mark not ready.
    if (!cache.has(chunk.hash)) cache.set(chunk.hash, chunk);
    this.chunkReady.set(chunk, false);

    const promise = (async () => {
      await this.readChunkInternal(chunk, dimension);
      this.chunkReady.set(chunk, true);
      return chunk;
    })()
      .catch((reason) => {
        cache.delete(chunk.hash);
        this.chunkReady.delete(chunk);
        throw reason;
      })
      .finally(() => {
        inflight.delete(chunk.hash);
      });

    inflight.set(chunk.hash, promise);
    return promise;
  }

  private async readChunkInternal(
    chunk: Chunk,
    dimension: Dimension
  ): Promise<void> {
    const chunkVersionKey = LevelDBKeyBuilder.buildChunkVersionKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );

    const chunkExists = this.tryGet(chunkVersionKey) !== null;

    if (chunkExists) {
      const offset = chunk.type === DimensionType.Overworld ? 4 : 0;

      // Attempt ALL subchunk indices (0..MAX_SUB_CHUNKS-1) regardless of failures.
      for (let i = 0; i < Chunk.MAX_SUB_CHUNKS; i++) {
        const cy = i - offset;

        try {
          const subchunk = this.readSubChunkOrNull(
            chunk.x,
            cy,
            chunk.z,
            dimension
          );

          // Set the subchunk if it was found.
          if (subchunk && !subchunk.isEmpty()) chunk.setSubChunk(cy, subchunk);
        } catch {
          // If a single subchunk is corrupt, don't abort the whole chunk load.
          // It will simply be treated as missing.
        }

        if ((i & 3) === 3) await this.yieldToMain();
      }

      const biomes = this.readChunkBiomes(chunk, dimension);

      if (biomes.length > 0) {
        for (let i = 0; i < biomes.length; i++) {
          const subchunk = chunk.subchunks[i];
          const biome = biomes[i];

          if (subchunk && biome) subchunk.biomes = biome;

          if ((i & 7) === 7) await this.yieldToMain();
        }
      }

      const entities = this.readChunkEntities(chunk, dimension);

      if (entities.length > 0) {
        for (let i = 0; i < entities.length; i++) {
          const storage = entities[i]!;
          const uniqueId = storage.get<LongTag>("UniqueID");

          if (uniqueId) {
            chunk.setEntityStorage(BigInt(uniqueId.valueOf()), storage, false);
          }

          if ((i & 7) === 7) await this.yieldToMain();
        }
      }

      const blocks = this.readChunkBlocks(chunk, dimension);

      if (blocks.length > 0) {
        for (let i = 0; i < blocks.length; i++) {
          const storage = blocks[i]!;
          chunk.setBlockStorage(storage.getPosition(), storage, false);

          if ((i & 7) === 7) await this.yieldToMain();
        }
      }

      return;
    }

    const resultant = await dimension.generator.apply(chunk.x, chunk.z);

    const entities = this.readChunkEntities(chunk, dimension);
    if (entities.length > 0) {
      for (let i = 0; i < entities.length; i++) {
        const storage = entities[i]!;
        const uniqueId = storage.get<LongTag>("UniqueID");

        if (uniqueId) {
          chunk.setEntityStorage(BigInt(uniqueId.valueOf()), storage, false);
        }

        if ((i & 7) === 7) await this.yieldToMain();
      }
    }

    chunk.insert(resultant);
    await dimension.generator.populate?.(chunk);
  }

  public async writeChunk(chunk: Chunk, dimension: Dimension): Promise<void> {
    const writes: Array<[Buffer, Buffer]> = [];

    const entities = chunk.getAllEntityStorages();
    this.collectChunkEntitiesWrites(chunk, dimension, entities, writes);

    const allBlocks = chunk.getAllBlockStorages();

    if (allBlocks.length > 0) {
      const nonEmptyBlocks: Array<BlockLevelStorage> = [];
      for (const storage of allBlocks) {
        if (storage.size > 0) nonEmptyBlocks.push(storage);
      }

      this.collectChunkBlocksWrites(chunk, dimension, nonEmptyBlocks, writes);
    } else {
      this.collectChunkBlocksWrites(chunk, dimension, [], writes);
    }

    if (chunk.isEmpty() || !chunk.dirty) {
      this.putMany(writes);
      return;
    }

    const offset = chunk.type === DimensionType.Overworld ? 4 : 0;

    // Write each non-empty subchunk.
    for (let cy = 0; cy < Chunk.MAX_SUB_CHUNKS; cy++) {
      const subchunk = chunk.getSubChunk(cy - offset);
      if (!subchunk || subchunk.isEmpty()) continue;

      const key = LevelDBKeyBuilder.buildSubChunkKey(
        chunk.x,
        cy - offset,
        chunk.z,
        dimension.indexOf()
      );

      const stream = new BinaryStream();
      SubChunk.serialize(subchunk, stream, true);

      writes.push([key, stream.getBuffer()]);
    }

    // Write biome data.
    this.collectChunkBiomesWrites(chunk, dimension, writes);

    /**
     * CRITICAL FIX:
     * Write the chunk version key LAST.
     *
     * Your read path treats "version key exists" as "chunk exists".
     * If putMany falls back to individual puts (no atomic batch),
     * writing version first can make partially-written chunks look complete.
     */
    const versionKey = LevelDBKeyBuilder.buildChunkVersionKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );
    writes.push([versionKey, LevelDBProvider.CHUNK_VERSION_BUFFER]);

    this.putMany(writes);

    chunk.dirty = false;
  }

  private readSubChunkOrNull(
    cx: number,
    cy: number,
    cz: number,
    dimension: Dimension
  ): SubChunk | null {
    const key = LevelDBKeyBuilder.buildSubChunkKey(
      cx,
      cy,
      cz,
      dimension.indexOf()
    );

    const buffer = this.safeGet(key);
    if (!buffer) return null;

    const subchunk = SubChunk.from(buffer, true);
    subchunk.index = cy;

    return subchunk;
  }

  public readSubChunk(
    cx: number,
    cy: number,
    cz: number,
    dimension: Dimension
  ): SubChunk {
    const subchunk = this.readSubChunkOrNull(cx, cy, cz, dimension);
    if (!subchunk) throw new Error("SubChunk not found.");
    return subchunk;
  }

  public writeSubChunk(
    subchunk: SubChunk,
    cx: number,
    cy: number,
    cz: number,
    dimension: Dimension
  ): void {
    const key = LevelDBKeyBuilder.buildSubChunkKey(
      cx,
      cy,
      cz,
      dimension.indexOf()
    );

    const stream = new BinaryStream();
    SubChunk.serialize(subchunk, stream, true);

    this.db.put(key, stream.getBuffer());
  }

  public readChunkEntities(
    chunk: Chunk,
    dimension: Dimension
  ): Array<CompoundTag> {
    const entityListKey = LevelDBKeyBuilder.buildEntityListKey(
      chunk,
      dimension
    );

    const listBuffer = this.safeGet(entityListKey);
    if (!listBuffer || listBuffer.length === 0) return [];

    try {
      const stream = new BinaryStream(listBuffer);
      const entities: Array<CompoundTag> = [];

      while (!stream.feof()) {
        const uniqueId = stream.readInt64(Endianness.Little);
        const entityKey = LevelDBKeyBuilder.buildEntityStorageKey(uniqueId);

        const buffer = this.safeGet(entityKey);
        if (!buffer) continue;

        const storageStream = new BinaryStream(buffer);
        entities.push(CompoundTag.read(storageStream));
      }

      return entities;
    } catch {
      return [];
    }
  }

  private collectChunkEntitiesWrites(
    chunk: Chunk,
    dimension: Dimension,
    entities: Array<[bigint, CompoundTag]>,
    writes: Array<[Buffer, Buffer]>
  ): void {
    const entityListKey = LevelDBKeyBuilder.buildEntityListKey(
      chunk,
      dimension
    );

    const stream = new BinaryStream();

    for (const [uniqueId, storage] of entities) {
      stream.writeInt64(uniqueId, Endianness.Little);

      const entityStorageKey =
        LevelDBKeyBuilder.buildEntityStorageKey(uniqueId);

      const storageStream = new BinaryStream();
      CompoundTag.write(storageStream, storage);

      writes.push([entityStorageKey, storageStream.getBuffer()]);
    }

    writes.push([entityListKey, stream.getBuffer()]);
  }

  public writeChunkEntities(
    chunk: Chunk,
    dimension: Dimension,
    entities: Array<[bigint, CompoundTag]>
  ): void {
    const writes: Array<[Buffer, Buffer]> = [];
    this.collectChunkEntitiesWrites(chunk, dimension, entities, writes);
    this.putMany(writes);
  }

  public readChunkBlocks(
    chunk: Chunk,
    dimension: Dimension
  ): Array<BlockLevelStorage> {
    const blockListKey = LevelDBKeyBuilder.buildBlockStorageListKey(
      chunk,
      dimension
    );

    const buffer = this.safeGet(blockListKey);
    if (!buffer || buffer.length === 0) return [];

    try {
      const stream = new BinaryStream(buffer);
      const blocks: Array<BlockLevelStorage> = [];

      while (!stream.feof()) {
        const compound = CompoundTag.read(stream);
        blocks.push(new BlockLevelStorage(chunk, compound));
      }

      return blocks;
    } catch {
      return [];
    }
  }

  private collectChunkBlocksWrites(
    chunk: Chunk,
    dimension: Dimension,
    blocks: Array<BlockLevelStorage>,
    writes: Array<[Buffer, Buffer]>
  ): void {
    const blockListKey = LevelDBKeyBuilder.buildBlockStorageListKey(
      chunk,
      dimension
    );

    const stream = new BinaryStream();

    for (const block of blocks) {
      CompoundTag.write(stream, block);
    }

    writes.push([blockListKey, stream.getBuffer()]);
  }

  public writeChunkBlocks(
    chunk: Chunk,
    dimension: Dimension,
    blocks: Array<BlockLevelStorage>
  ): void {
    const writes: Array<[Buffer, Buffer]> = [];
    this.collectChunkBlocksWrites(chunk, dimension, blocks, writes);
    this.putMany(writes);
  }

  public readPlayer(uuid: string): CompoundTag | null {
    try {
      const key = Buffer.from(`${LevelDBProvider.PLAYER_PREFIX}${uuid}`);
      const buffer = this.safeGet(key);

      if (!buffer) return null;

      const stream = new BinaryStream(buffer);
      return CompoundTag.read(stream);
    } catch {
      return null;
    }
  }

  public writePlayer(uuid: string, player: CompoundTag): void {
    const stream = new BinaryStream();
    CompoundTag.write(stream, player);

    const key = Buffer.from(`${LevelDBProvider.PLAYER_PREFIX}${uuid}`);
    this.db.put(key, stream.getBuffer());
  }

  public readChunkBiomes(
    chunk: Chunk,
    dimension: Dimension
  ): Array<BiomeStorage> {
    const biomeListKey = LevelDBKeyBuilder.buildBiomeStorageKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );

    const buffer = this.safeGet(biomeListKey);
    if (!buffer || buffer.length === 0) return [];

    try {
      const biomes: Array<BiomeStorage> = [];
      const stream = new BinaryStream(buffer);

      stream.read(512);

      for (let i = 0; i < chunk.subchunks.length; i++) {
        biomes.push(BiomeStorage.deserialize(stream, true));
      }

      return biomes;
    } catch {
      return [];
    }
  }

  private collectChunkBiomesWrites(
    chunk: Chunk,
    dimension: Dimension,
    writes: Array<[Buffer, Buffer]>
  ): void {
    const biomeListKey = LevelDBKeyBuilder.buildBiomeStorageKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );

    const stream = new BinaryStream();

    stream.write(LevelDBProvider.EMPTY_HEIGHTMAP);

    for (const subchunk of chunk.subchunks) {
      // Assumes SubChunk instances exist across the array; if not, this will throw.
      // Keeping behavior consistent with existing code.
      BiomeStorage.serialize(subchunk.biomes, stream, true);
    }

    writes.push([biomeListKey, stream.getBuffer()]);
  }

  public writeChunkBiomes(chunk: Chunk, dimension: Dimension): void {
    const writes: Array<[Buffer, Buffer]> = [];
    this.collectChunkBiomesWrites(chunk, dimension, writes);
    this.putMany(writes);
  }

  public writeChunkVersion(
    cx: number,
    cz: number,
    dimension: Dimension,
    version: number
  ): void {
    const key = LevelDBKeyBuilder.buildChunkVersionKey(
      cx,
      cz,
      dimension.indexOf()
    );

    if (version === LevelDBProvider.CHUNK_VERSION) {
      this.db.put(key, LevelDBProvider.CHUNK_VERSION_BUFFER);
      return;
    }

    this.db.put(key, Buffer.from([version]));
  }

  public hasChunk(cx: number, cz: number, dimension: Dimension): boolean {
    const key = LevelDBKeyBuilder.buildChunkVersionKey(
      cx,
      cz,
      dimension.indexOf()
    );

    return this.tryGet(key) !== null;
  }

  public static async initialize(
    serenity: Serenity,
    properties: WorldProviderProperties
  ): Promise<void> {
    const path = resolve(properties.path);

    if (!existsSync(path)) mkdirSync(path);

    const directories = readdirSync(path, { withFileTypes: true }).filter(
      (dirent) => dirent.isDirectory()
    );

    if (directories.length === 0) {
      serenity.registerWorld(
        await this.create(serenity, properties, { identifier: "default" })
      );
      return;
    }

    for (const directory of directories) {
      const worldPath = resolve(path, directory.name);

      let properties: Partial<WorldProperties> = { identifier: directory.name };
      const propertiesPath = resolve(worldPath, "properties.json");

      if (existsSync(propertiesPath)) {
        properties = JSON.parse(readFileSync(propertiesPath, "utf-8"));
      }

      const structuresPath = resolve(worldPath, "structures");
      if (!existsSync(structuresPath)) mkdirSync(structuresPath);

      const world = new World(serenity, new this(worldPath), properties);

      new WorldInitializeSignal(world).emit();

      writeFileSync(propertiesPath, JSON.stringify(world.properties, null, 2));

      const files = readdirSync(structuresPath, {
        withFileTypes: true
      }).filter(
        (dirent) => dirent.isFile() && dirent.name.endsWith(".mcstructure")
      );

      for (const file of files) {
        try {
          const structurePath = resolve(structuresPath, file.name);
          const stream = new BinaryStream(readFileSync(structurePath));

          const structure = Structure.from(world, CompoundTag.read(stream));
          const identifier = file.name.replace(/\.mcstructure$/, "");

          world.structures.set(identifier, structure);

          world.logger.debug(
            `Loaded structure "${identifier}" from file "${file.name}" for world "${world.properties.identifier}."`
          );
        } catch (reason) {
          world.logger.error(
            `Failed to load structure from file ${file.name} for world ${world.properties.identifier}. Reason:`,
            reason
          );
        }
      }

      serenity.registerWorld(world);
    }
  }

  public static async create(
    serenity: Serenity,
    properties: WorldProviderProperties,
    worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    const path = resolve(properties.path);

    if (!existsSync(path)) mkdirSync(path);

    if (!worldProperties?.identifier)
      throw new Error("A world identifier is required to create a new world.");

    const worldPath = resolve(path, worldProperties.identifier);

    if (existsSync(worldPath))
      throw new Error(
        `World with identifier ${worldProperties.identifier} already exists in the directory.`
      );

    mkdirSync(worldPath);

    const world = new World(serenity, new this(worldPath), worldProperties);

    world.provider.world = world;

    new WorldInitializeSignal(world).emit();

    writeFileSync(
      resolve(worldPath, "properties.json"),
      JSON.stringify(world.properties, null, 2)
    );

    return world;
  }

  public static async loadFromExistingPath(
    serenity: Serenity,
    path: string
  ): Promise<World> {
    path = resolve(path);

    if (!existsSync(path))
      throw new Error(
        `World directory at path ${path} does not exist, try creating it instead.`
      );

    let worldProperties: Partial<WorldProperties> = {};
    const propertiesPath = resolve(path, "properties.json");

    if (existsSync(propertiesPath)) {
      worldProperties = JSON.parse(readFileSync(propertiesPath, "utf-8"));
    }

    if (!worldProperties.identifier)
      throw new Error(
        `World at path ${path} does not have a valid identifier in its properties file.`
      );

    const world = new World(serenity, new this(path), worldProperties);
    new WorldInitializeSignal(world).emit();

    return world;
  }

  public static async createFromGivenPath(
    serenity: Serenity,
    path: string,
    worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    path = resolve(path);

    if (existsSync(path))
      throw new Error(
        `World directory at path ${path} already exists, try loading it instead.`
      );

    if (!worldProperties?.identifier)
      throw new Error("A world identifier is required to create a new world.");

    mkdirSync(path, { recursive: true });

    const world = new World(serenity, new this(path), worldProperties);

    world.provider.world = world;

    new WorldInitializeSignal(world).emit();

    writeFileSync(
      resolve(path, "properties.json"),
      JSON.stringify(world.properties, null, 2)
    );

    return world;
  }
}

export { LevelDBProvider };
