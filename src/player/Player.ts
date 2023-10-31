import { AddPlayer, PlayerList } from '@serenityjs/protocol';
import type { Encapsulated, Vec2f, Vec3f } from '@serenityjs/protocol';
import type { Session } from '@serenityjs/raknet.js';
import type { Serenity } from '../Serenity';
import { Skin } from '../skin';
import type { LoginTokenData } from '../types';
import type { World } from '../world';
import type { NetworkSession } from './NetworkSession';

class Player {
	private readonly serenity: Serenity;
	private readonly session: Session;
	private readonly network: NetworkSession;

	public readonly runtimeId: bigint;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly skin: Skin;

	public world: World;
	public position: Vec3f = { x: 0, y: 0, z: 0 };
	public rotation: Vec2f = { x: 0, z: 0 };
	public headYaw: number = 0;
	public onGround: boolean = false;

	public constructor(network: NetworkSession, tokens: LoginTokenData, world?: World) {
		this.serenity = network.serenity;
		this.session = network.session;
		this.network = network;
		this.runtimeId = network.runtimeId;
		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = network.session.guid;
		this.skin = new Skin(tokens.clientData);
		this.world = world ?? this.serenity.defaultWorld;
	}

	public getSessionGuid(): bigint {
		return this.session.guid;
	}

	public sendPacket(packet: Encapsulated): void {
		this.network.send(packet.serialize());
	}

	public addPlayerToList(...players: Player[]): void {
		// Create the player list packet
		const list = new PlayerList();
		list.type = 0;
		// Map the players to the player list record
		list.records = players.map((player) => {
			return {
				uuid: player.uuid,
				runtimeId: player.runtimeId,
				username: player.username,
				xuid: player.xuid,
				platformChatId: '',
				buildPlatform: 0,
				skinData: player.skin.serialize(),
				isTeacher: false,
				isHost: false,
			};
		});
		// Send the player list packet to the player
		return this.sendPacket(list);
	}

	public removePlayerFromList(...players: Player[]): void {
		// Create the player list packet
		const list = new PlayerList();
		list.type = 1;
		// Map the players to the player list record
		list.records = players.map((player) => {
			return {
				uuid: player.uuid,
			};
		});
		// Send the player list packet to the player
		return this.sendPacket(list);
	}

	public spawnPlayer(...players: Player[]): void {
		// Loop through all the players
		for (const player of players) {
			const packet = new AddPlayer();
			packet.uuid = player.uuid;
			packet.username = player.username;
			packet.runtimeId = player.runtimeId;
			packet.platformChatId = '';
			packet.x = player.position.x;
			packet.y = player.position.y;
			packet.z = player.position.z;
			packet.yaw = player.rotation.z;
			packet.pitch = player.rotation.x;
			packet.headYaw = player.headYaw;
			this.sendPacket(packet);
		}
	}
}

export { Player };
