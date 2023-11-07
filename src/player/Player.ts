import type { Encapsulated, MoveMode, Vec2f, Vec3f } from '@serenityjs/protocol';
import { AddPlayer, MovePlayer, PlayerList, Text, ChatTypes, ToastRequest } from '@serenityjs/protocol';
import type { Session } from '@serenityjs/raknet.js';
import type { Serenity } from '../Serenity';
import { PlayerAbilities } from '../abilities';
import { PlayerAttributes } from '../attributes';
import { ActionForm, MessageForm } from '../forms';
import type { Logger } from '../logger';
import type { NetworkSession } from '../session';
import { Skin } from '../skin';
import type { LoginTokenData } from '../types';
import type { World } from '../world';
import type { PlayerHandler } from './handlers';
import { playerHandlers } from './handlers';

class Player {
	private readonly serenity: Serenity;
	private readonly session: Session;
	private readonly network: NetworkSession;
	private readonly logger: Logger;

	public readonly handlers = playerHandlers;
	public readonly runtimeId: bigint;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly skin: Skin;
	public readonly attributes: PlayerAttributes;
	public readonly abilities: PlayerAbilities;

	public world: World;
	public position: Vec3f = { x: 0, y: 0, z: 0 };
	public rotation: Vec2f = { x: 0, z: 0 };
	public headYaw: number = 0;
	public onGround: boolean = false;
	public sneaking: boolean = false;

	public constructor(network: NetworkSession, tokens: LoginTokenData, world?: World) {
		this.serenity = network.serenity;
		this.session = network.session;
		this.network = network;
		this.logger = network.serenity.logger;
		this.runtimeId = network.runtimeId;
		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = network.session.guid;
		this.skin = new Skin(tokens.clientData);
		this.attributes = new PlayerAttributes(this, network.serenity.logger);
		this.abilities = new PlayerAbilities(this, network.serenity.logger);
		this.world = world ?? this.serenity.defaultWorld;
	}

	public getHandler(name: string): typeof PlayerHandler {
		return this.handlers.find((handler) => handler.name.startsWith(name))!;
	}

	public getSessionGuid(): bigint {
		return this.session.guid;
	}

	public sendPacket(packet: Encapsulated): void {
		this.network.send(packet.serialize());
	}

	public createMessageForm(): MessageForm {
		return new MessageForm(this);
	}

	public createActionForm(): ActionForm {
		return new ActionForm(this);
	}

	public addPlayerToList(...players: Player[]): void {
		// Check if length is 0
		if (players.length === 0) {
			return;
		}

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
		// Check if length is 0
		if (players.length === 0) {
			return;
		}

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
		// Check if length is 0
		if (players.length === 0) {
			return;
		}

		// Loop through all the players
		for (const player of players) {
			const packet = new AddPlayer();
			packet.uuid = player.uuid;
			packet.username = player.username;
			packet.runtimeId = player.runtimeId;
			packet.platformChatId = '';
			packet.position = { x: 0, y: 30, z: 0 };
			packet.velocity = { x: 0, y: 0, z: 0 };
			packet.rotation = player.rotation;
			packet.headYaw = player.headYaw;
			packet.item = 0;
			packet.gamemode = 0;
			packet.metadata = 0;
			packet.propertiesInts = 0;
			packet.propertiesFloats = 0;
			packet.uniqueId = player.runtimeId;
			packet.permissionLevel = 2;
			packet.commandPermission = 0;
			packet.abilities = 0;
			packet.links = 0;
			packet.deviceId = 'Win10';
			packet.deviceOS = 7;
			this.sendPacket(packet);
		}
	}

	public sendToast(title: string, message: string): void {
		if (!title || !message) {
			new Error('Title or message is not defined');
		}

		const toast = new ToastRequest();
		toast.title = title;
		toast.message = message;

		this.sendPacket(toast);
	}

	public broadcastMovement(mode: MoveMode, ...players: Player[]): void {
		// Check if length is 0
		if (players.length === 0) {
			return;
		}

		for (const player of players) {
			const packet = new MovePlayer();
			packet.runtimeId = player.runtimeId;
			packet.position = player.position;
			packet.pitch = player.rotation.x;
			packet.yaw = player.rotation.z;
			packet.headYaw = player.headYaw;
			packet.mode = mode;
			packet.onGround = player.onGround;
			packet.ridingRuntimeId = 0n;
			packet.tick = 0n;
			this.sendPacket(packet);
		}
	}

	public sendMessage(message: string): void {
		const text = new Text();
		text.type = ChatTypes.Chat;
		text.needsTranslation = false;
		text.source = '';
		text.message = message;
		text.xuid = this.xuid;
		text.platformChatId = '';
		this.sendPacket(text);
	}
}

export { Player };
