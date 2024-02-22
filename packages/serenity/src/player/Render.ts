import {
	AddPlayer,
	CommandPermissionLevel,
	LevelChunk,
	PermissionLevel,
	PlayerList,
	RecordAction,
	RemoveEntity,
} from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import type { Chunk } from '../world/index.js';
import type { Player } from './Player.js';

class Render {
	protected readonly serenity: Serenity;
	protected readonly player: Player;

	/**
	 * The players that are being rendered to this player.
	 */
	public readonly players: Set<bigint>;

	/**
	 * The chunks that are being rendered to this player.
	 */
	public readonly chunks: Set<bigint>;

	public constructor(serenity: Serenity, player: Player) {
		this.serenity = serenity;
		this.player = player;

		this.players = new Set();
		this.chunks = new Set();
	}

	public addPlayer(player: Player): void {
		// Check if the player is already being rendered.
		if (this.players.has(player.uniqueId)) return;

		// Construct the a new PlayerList packet.
		const list = new PlayerList();
		list.action = RecordAction.Add;
		list.records = [
			{
				uuid: player.uuid,
				entityUniqueId: player.uniqueId,
				username: player.username,
				xuid: player.xuid,
				platformChatId: '',
				buildPlatform: 0,
				skin: player.skin.serialize(),
				isTeacher: false,
				isHost: false,
			},
		];

		// Construct the a new AddPlayer packet.
		const entity = new AddPlayer();
		entity.uuid = player.uuid;
		entity.username = player.username;
		entity.runtimeId = player.runtimeId;
		entity.platformChatId = ''; // TODO: Not sure what this is.
		entity.position = player.position;
		entity.velocity = { x: 0, y: 5, z: 0 };
		entity.rotation = player.rotation;
		entity.headYaw = player.rotation.z;
		entity.heldItem = {
			networkId: 0,
		};
		entity.gamemode = 0; // TODO: Get the gamemode from the player.
		entity.metadata = [];
		entity.properties = {
			ints: [],
			floats: [],
		};
		entity.uniqueEntityId = player.uniqueId;
		entity.premissionLevel = PermissionLevel.Member; // TODO: Get the permission level from the player.
		entity.commandPermission = CommandPermissionLevel.Normal; // TODO: Get the command permission from the player.
		entity.abilities = [];
		entity.links = [];
		entity.deviceId = 'Win10';
		entity.deviceOS = 7; // TODO: Get the device OS from the player.

		// Add the player to the set.
		this.players.add(player.uniqueId);

		// Send the packets to the player.
		void this.player.session.send(list, entity);
	}

	public removePlayer(player: Player): void {
		// Check if the player is not being rendered.
		if (!this.players.has(player.uniqueId)) return;

		// Construct the a new PlayerList packet.
		const list = new PlayerList();
		list.action = RecordAction.Remove;
		list.records = [
			{
				uuid: player.uuid,
			},
		];

		// Construct the a new RemoveEntity packet.
		const entity = new RemoveEntity();
		entity.uniqueEntityId = player.uniqueId;

		// Remove the player from the set.
		this.players.delete(player.uniqueId);

		// Send the packet to the player.
		void this.player.session.send(list, entity);
	}

	public sendChunk(chunk: Chunk): void {
		// Check if the chunk is already being rendered.
		if (this.chunks.has(chunk.getHash())) return;

		// Construct a new LevelChunk packet.
		const packet = new LevelChunk();

		// And assign the packet data.
		packet.x = chunk.x;
		packet.z = chunk.z;
		packet.dimension = this.player.getDimension().type;
		packet.subChunkCount = chunk.getSubChunkSendCount();
		packet.cacheEnabled = false;
		packet.data = chunk.serialize();

		// Add the chunk to the set.
		this.chunks.add(chunk.getHash());

		// Send the packet to the player.
		void this.player.session.send(packet);
	}

	public getChunks(): Chunk[] {
		return [...this.chunks.values()].map((x) => this.player.getDimension().getChunkFromHash(x)) as Chunk[];
	}
}

export { Render };
