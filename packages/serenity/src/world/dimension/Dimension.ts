import {
	AddPlayer,
	CommandPermissionLevel,
	PermissionLevel,
	RemoveEntity,
	UpdateBlock,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
} from '@serenityjs/bedrock-protocol';
import type { DimensionType, DataPacket, Vec3f } from '@serenityjs/bedrock-protocol';
import { Logger } from '../../console';
import { Player } from '../../player';
import type { World } from '../World';
import type { BlockPermutation } from '../chunk';
import { Block, Chunk } from '../chunk';
import type { TerrainGenerator } from '../generator';

class Dimension {
	protected readonly world: World;
	protected readonly logger: Logger;

	public generator: TerrainGenerator;
	public spawnPosition: Vec3f = { x: 0, y: 0, z: 0 };
	public viewDistance: number = 64;

	public readonly type: DimensionType;
	public readonly identifier: string;
	public readonly chunks: Map<bigint, Chunk>;
	public readonly players: Set<bigint>;

	public constructor(
		world: World,
		type: DimensionType,
		identifier: string,
		generator: TerrainGenerator,
		chunks?: Map<bigint, Chunk>,
	) {
		this.world = world;
		this.logger = new Logger(`Dimension [${identifier}]`, '#03fca9');
		this.type = type;
		this.identifier = identifier;
		this.generator = generator;
		this.chunks = chunks ?? new Map();
		this.players = new Set();
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

	public spawnEntity(entity: Player | any): void {
		// Check if the entity is a player
		if (entity instanceof Player) {
			// Check if the player is already in the dimension
			if (this.players.has(entity.uniqueEntityId)) {
				return this.logger.error(`${entity.username} (${entity.xuid}) is already in the dimension!`);
			}

			// Create a new add entity packet
			const spawn = new AddPlayer();
			spawn.uuid = entity.uuid;
			spawn.username = entity.username;
			spawn.runtimeId = entity.runtimeEntityId;
			spawn.platformChatId = ''; // TODO: Not sure what this is.
			spawn.position = entity.position;
			spawn.velocity = { x: 0, y: 0, z: 0 };
			spawn.rotation = entity.rotation;
			spawn.headYaw = entity.headYaw;
			spawn.heldItem = {
				networkId: 0,
				count: null,
				metadata: null,
				hasStackId: null,
				stackId: null,
				blockRuntimeId: null,
				extras: null,
			};
			spawn.gamemode = entity.getGamemode(); // TODO: Get the gamemode from the entity.
			spawn.metadata = [];
			spawn.properties = {
				ints: [],
				floats: [],
			};
			spawn.uniqueEntityId = entity.uniqueEntityId;
			spawn.premissionLevel = PermissionLevel.Member; // TODO: Get the permission level from the entity.
			spawn.commandPermission = CommandPermissionLevel.Normal; // TODO: Get the command permission from the entity.
			spawn.abilities = [];
			spawn.links = [];
			spawn.deviceId = 'Win10';
			spawn.deviceOS = 7; // TODO: Get the device OS from the entity.

			void this.broadcast(spawn);

			// Add the player to the dimension
			this.players.add(entity.uniqueEntityId);
		}
	}

	public despawnEntity(entity: Player | any): void {
		// Check if the entity is a player
		if (entity instanceof Player) {
			// Check if the player is not in the dimension
			if (!this.players.has(entity.uniqueEntityId)) {
				return this.logger.error(`${entity.username} (${entity.xuid}) is not in the dimension!`);
			}

			// Remove the player from the dimension
			this.players.delete(entity.uniqueEntityId);

			// Create a new remove entity packet
			const remove = new RemoveEntity();
			remove.uniqueEntityId = entity.uniqueEntityId;

			// Send the packet to all players
			void this.broadcast(remove);
		}
	}

	public getPlayers(): Player[] {
		const players = [];

		for (const uniqueEntityId of this.players) {
			const player = this.world.players.get(uniqueEntityId);

			if (player) {
				players.push(player);
			}
		}

		return players;
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param x Chunk x.
	 * @param y Chunk z.
	 * @returns Already generated or new chunk.
	 */
	public getChunk(x: number, y: number): Chunk {
		// Calulate the hash value
		const hash = Chunk.getHash(x, y);

		// Check if the chunk is already generated
		const chunk = this.chunks.get(hash) ?? this.generator.apply(new Chunk(x, y));

		// Set the chunk
		this.chunks.set(hash, chunk);

		// Return the chunk
		return chunk;
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param hash The chunk hash.
	 * @returns Already generated or new chunk.
	 */
	public getChunkFromHash(hash: bigint): Chunk {
		// Calulate the x and z values
		const vec2f = Chunk.fromHash(hash);

		// Return the chunk
		return this.getChunk(vec2f.x, vec2f.z);
	}

	public getSpawnChunks(): Chunk[] {
		// Prepare an array to store the chunks
		const chunks = [];

		// Calculate the view distance in chunks
		const distance = this.viewDistance >> 4;

		const minX = this.spawnPosition.x - distance;
		const minZ = this.spawnPosition.z - distance;
		const maxX = this.spawnPosition.x + distance;
		const maxZ = this.spawnPosition.z + distance;

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
}

export { Dimension };
