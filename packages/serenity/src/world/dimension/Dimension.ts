import type { DataPacket, MetadataFlags } from '@serenityjs/bedrock-protocol';
import {
	AddPlayer,
	CommandPermissionLevel,
	PermissionLevel,
	RemoveEntity,
	UpdateBlock,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	DimensionType,
	AddEntity,
	SetEntityData,
	Vector3f,
	MetadataKey,
} from '@serenityjs/bedrock-protocol';
import type { EntityComponent } from '../../entity/index.js';
import { ENTITY_COMPONENTS, Entity } from '../../entity/index.js';
import { Player } from '../../player/index.js';
import type { WorldProvider } from '../../provider/index.js';
import type { World } from '../World.js';
import { Block, Chunk } from '../chunk/index.js';
import type { BlockPermutation } from '../chunk/index.js';
import type { TerrainGenerator } from '../generator/index.js';

class Dimension {
	public readonly identifier: string;
	public readonly type: DimensionType;
	public readonly world: World;
	public readonly provider: WorldProvider;
	public readonly entities: Map<bigint, Entity>;

	public generator: TerrainGenerator;
	public spawn: Vector3f;
	public viewDistance: number = 128;

	public constructor(identifier: string, type: DimensionType, generator: TerrainGenerator, world: World) {
		this.identifier = identifier;
		this.type = type;
		this.world = world;
		this.provider = this.world.provider;
		this.entities = new Map();
		this.generator = generator;
		this.spawn = new Vector3f(0, 65, 0);
	}

	public broadcast(...packets: DataPacket[]): void {
		// Loop through each player.
		for (const player of this.getPlayers().values()) {
			// Send the packet to that player.
			player.session.send(...packets);
		}
	}

	public broadcastExcept(player: Player, ...packets: DataPacket[]): void {
		// Loop through each player.
		for (const other of this.getPlayers().values()) {
			if (other === player) continue;

			// Send the packet to that player.
			other.session.send(...packets);
		}
	}

	public spawnEntity(identifier: string, position: Vector3f): Entity {
		// Construct a new Entity.
		const entity = new Entity(identifier, this);

		// Set the position of the entity.
		entity.position.x = position.x;
		entity.position.y = position.y;
		entity.position.z = position.z;

		// Get the entities components.
		const components =
			ENTITY_COMPONENTS[identifier as keyof typeof ENTITY_COMPONENTS] ?? ENTITY_COMPONENTS['minecraft:generic'];
		for (const component of components) {
			// Create a new instance of the component.
			const instance: EntityComponent = new (component as any)(entity);

			// Set the component to the entity.
			entity.components.set(instance.identifier, instance);
		}

		// Spawn the entity.
		entity.spawn();

		// Return the entity.
		return entity;
	}

	public despawnEntity(entity: Entity): void {
		// Construct a new RemoveEntity packet.
		const packet = new RemoveEntity();
		packet.uniqueEntityId = entity.uniqueId;

		// Broadcast the packet to the dimension.
		this.broadcast(packet);

		// Remove the entity from the dimension.
		this.entities.delete(entity.uniqueId);
	}

	public updateEntity(entity: Entity): void {
		// Construct a new SetEntityData packet.
		const packet = new SetEntityData();

		// Set the packet data.
		packet.runtimeEntityId = entity.runtimeId;
		packet.metadata = entity.getMetadata().map((entry) => {
			return {
				key: entry.flag ? MetadataKey.Flags : (entry.key as MetadataKey),
				type: entry.type,
				value: entry.currentValue,
				flag: entry.flag ? (entry.key as MetadataFlags) : undefined,
			};
		});
		packet.properties = {
			ints: [],
			floats: [],
		};
		packet.tick = 0n;

		// Send the packet to the dimension.
		this.broadcast(packet);
	}

	public getPlayers(): Player[] {
		return [...this.entities.values()].filter((entity) => entity instanceof Player) as Player[];
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param cx Chunk x.
	 * @param cy Chunk z.
	 * @returns Already generated or new chunk.
	 */
	public getChunk(cx: number, cy: number): Chunk {
		return this.provider.readChunk(cx, cy, this);
	}

	/**
	 * Set a chunk in the dimension.
	 *
	 * @param chunk The chunk to set.
	 */
	public setChunk(chunk: Chunk): void {
		this.provider.writeChunk(chunk, this);
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param hash The chunk hash.
	 * @returns Already generated or new chunk.
	 */
	public getChunkFromHash(hash: bigint): Chunk {
		// Calulate the x and z values
		const coords = Chunk.fromHash(hash);

		// Return the chunk
		return this.getChunk(coords.x, coords.z);
	}

	public getSpawnChunks(): Chunk[] {
		// Prepare an array to store the chunks
		const chunks = [];

		// Calculate the view distance in chunks
		const distance = this.viewDistance >> 4;

		const minX = this.spawn.x - distance;
		const minZ = this.spawn.z - distance;
		const maxX = this.spawn.x + distance;
		const maxZ = this.spawn.z + distance;

		for (let cx = minX; cx <= maxX; ++cx) {
			for (let cz = minZ; cz <= maxZ; ++cz) {
				chunks.push(this.getChunk(cx, cz));
			}
		}

		// Return the chunks
		return chunks;
	}

	public getChunksToRender(x: number, z: number): Chunk[] {
		// Prepare an array to store the chunks
		const chunks = [];

		// Calculate the view distance in chunks
		const distance = this.viewDistance >> 4;

		const minX = x - distance;
		const minZ = z - distance;
		const maxX = x + distance;
		const maxZ = z + distance;

		for (let cx = minX; cx <= maxX; ++cx) {
			for (let cz = minZ; cz <= maxZ; ++cz) {
				chunks.push(this.getChunk(cx, cz));
			}
		}

		// Return the chunks
		return chunks;
	}

	public getBlock(x: number, y: number, z: number): Block {
		// Get the chunk
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Get the block permutation
		const permutation = chunk.getPermutation(x, y, z);

		// Convert the permutation to a block.
		const block = new Block(this, permutation, { x, y, z });

		// Fire the block construct event.
		permutation.type.behavior.onConstructed?.(block);

		// Return the block
		return block;
	}

	public setPermutation(x: number, y: number, z: number, permutation: BlockPermutation): void {
		// Get the chunk
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Set the permutation
		chunk.setPermutation(x, y, z, permutation);

		for (const player of this.getPlayers()) {
			const update = new UpdateBlock();
			update.blockRuntimeId = permutation.getRuntimeId();
			update.position = { x, y, z };
			update.flags = UpdateBlockFlagsType.Network;
			update.layer = UpdateBlockLayerType.Normal;

			player.session.send(update);
		}

		// Set th chunk
		return this.setChunk(chunk);
	}

	public static resolveType(type: number | string): DimensionType {
		switch (type) {
			case 0:
			case 'overworld':
			case 'minecraft:overworld':
				return DimensionType.Overworld;
			case 1:
			case 'nether':
			case 'minecraft:nether':
				return DimensionType.Nether;
			case 2:
			case 'end':
			case 'minecraft:end':
				return DimensionType.End;
			default:
				return DimensionType.Overworld;
		}
	}
}

export { Dimension };
