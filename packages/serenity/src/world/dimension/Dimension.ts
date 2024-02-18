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
} from '@serenityjs/bedrock-protocol';
import type { DataPacket, Vector3f } from '@serenityjs/bedrock-protocol';
import { Entity } from '../../entity/index.js';
import type { Player } from '../../player/index.js';
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
	public readonly players: Map<bigint, Player>;

	public generator: TerrainGenerator;
	public spawn: Vector3f;
	public viewDistance: number = 64;

	public constructor(identifier: string, type: DimensionType, generator: TerrainGenerator, world: World) {
		this.identifier = identifier;
		this.type = type;
		this.world = world;
		this.provider = this.world.provider;
		this.entities = new Map();
		this.players = new Map();
		this.generator = generator;
		this.spawn = { x: 0, y: 0, z: 0 };
	}

	public async broadcast(...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const player of this.getPlayers().values()) {
			// Send the packet to that player.
			await player.session.send(...packets);
		}
	}

	public async broadcastExcept(player: Player, ...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const other of this.getPlayers().values()) {
			if (other === player) continue;

			// Send the packet to that player.
			await other.session.send(...packets);
		}
	}

	public spawnEntity(identifier: string, position: Vector3f): Entity {
		// Construct a new Entity.
		const entity = new Entity(identifier, this);

		// Set the position of the entity.
		entity.position.x = position.x;
		entity.position.y = position.y;
		entity.position.z = position.z;

		// Construct a new AddEntity packet.
		const packet = new AddEntity();
		packet.uniqueEntityId = entity.uniqueId;
		packet.runtimeId = entity.runtimeId;
		packet.identifier = entity.identifier;
		packet.position = entity.position;
		packet.velocity = entity.velocity;
		packet.rotation = entity.rotation;
		packet.bodyYaw = entity.rotation.y;
		packet.attributes = [];
		packet.metadata = entity.getMetadataDictionary();
		packet.properties = {
			ints: [],
			floats: [],
		};
		packet.links = [];

		// Broadcast the packet to the dimension.
		void this.broadcast(packet);

		// Add the entity to the dimension.
		this.entities.set(entity.uniqueId, entity);

		// Return the entity.
		return entity;
	}

	public despawnEntity(entity: Entity): void {
		// Construct a new RemoveEntity packet.
		const packet = new RemoveEntity();
		packet.uniqueEntityId = entity.uniqueId;

		// Broadcast the packet to the dimension.
		void this.broadcast(packet);

		// Remove the entity from the dimension.
		this.entities.delete(entity.uniqueId);
	}

	public updateEntity(entity: Entity): void {
		// Construct a new SetEntityData packet.
		const packet = new SetEntityData();

		// Set the packet data.
		packet.runtimeEntityId = entity.runtimeId;
		packet.metadata = entity.getMetadataDictionary();
		packet.properties = {
			ints: [],
			floats: [],
		};
		packet.tick = 0n;

		// Send the packet to the dimension.
		void this.broadcast(packet);
	}

	public spawnPlayer(player: Player): void {
		const spawn = new AddPlayer();
		spawn.uuid = player.uuid;
		spawn.username = player.username;
		spawn.runtimeId = player.runtimeId;
		spawn.platformChatId = ''; // TODO: Not sure what this is.
		spawn.position = player.position;
		spawn.velocity = { x: 0, y: 0, z: 0 };
		spawn.rotation = player.rotation;
		spawn.headYaw = player.rotation.z;
		spawn.heldItem = {
			networkId: 0,
			count: null,
			metadata: null,
			hasStackId: null,
			stackId: null,
			blockRuntimeId: null,
			extras: null,
		};
		spawn.gamemode = player.gamemode; // TODO: Get the gamemode from the player.
		spawn.metadata = [];
		spawn.properties = {
			ints: [],
			floats: [],
		};
		spawn.uniqueEntityId = player.uniqueId;
		spawn.premissionLevel = PermissionLevel.Member; // TODO: Get the permission level from the entity.
		spawn.commandPermission = CommandPermissionLevel.Normal; // TODO: Get the command permission from the entity.
		spawn.abilities = [];
		spawn.links = [];
		spawn.deviceId = 'Win10';
		spawn.deviceOS = 7; // TODO: Get the device OS from the entity.

		void this.broadcast(spawn);

		// Add the player to the dimension
		this.players.set(player.uniqueId, player);
	}

	public despawnPlayer(player: Player): void {
		const despawn = new RemoveEntity();
		despawn.uniqueEntityId = player.uniqueId;

		void this.broadcast(despawn);

		// Remove the player from the dimension
		this.players.delete(player.uniqueId);
	}

	public getPlayers(): Player[] {
		return [...this.players.values()];
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

		// Convert the permutation to a block and return it
		return new Block(this, permutation, { x, y, z });
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

			void player.session.send(update);
		}
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
