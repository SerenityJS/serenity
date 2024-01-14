import type { DataPacket, MoveMode, Vec2f, Vec3f } from '@serenityjs/bedrock-protocol';
import {
	AbilityLayerFlag,
	ChatTypes,
	Text,
	ToastRequest,
	SetTitle,
	TitleTypes,
	MovePlayer,
} from '@serenityjs/bedrock-protocol';
import { ZigZag } from '@serenityjs/binarystream';
import type { Serenity } from '../Serenity';
import type { Network, NetworkSession } from '../network';
import type { LoginTokenData } from '../types';
import { Abilities } from './abilities';
import { Skin } from './skin';

/**
 * The player class.
 */
class Player {
	protected readonly serenity: Serenity;
	public readonly network: Network;
	public readonly session: NetworkSession;

	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly runtimeId: bigint;
	public readonly uniqueId: bigint;
	public readonly skin: Skin;
	public readonly abilities: Abilities;

	public position: Vec3f = { x: 0, y: 0, z: 0 };
	public rotation: Vec2f = { x: 0, z: 0 };
	public headYaw: number = 0;
	public onGround: boolean = false;

	/**
	 * Creates a new player.
	 *
	 * @param session The network session.
	 * @param tokens The login tokens.
	 */
	public constructor(session: NetworkSession, tokens: LoginTokenData) {
		this.serenity = session.serenity;
		this.network = session.network;
		this.session = session;

		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = session.guid;
		this.runtimeId = session.runtimeId;
		this.uniqueId = session.uniqueId;
		this.skin = new Skin(tokens.clientData);
		this.abilities = new Abilities(this);
	}

	/**
	 * Sets the player's ability to fly.
	 *
	 * @param mayFly Whether the player can fly or not.
	 */
	public setMayFly(mayFly: boolean): boolean {
		// Set the may fly ability.
		this.abilities.setAbility(AbilityLayerFlag.MayFly, mayFly);

		// Return the value of the may fly ability.
		return this.getMayFly();
	}

	/**
	 * Gets the player's ability to fly.
	 *
	 * @returns Whether the player can fly or not.
	 */
	public getMayFly(): boolean {
		// Return the may fly ability.
		return this.abilities.getAbility(AbilityLayerFlag.MayFly);
	}

	public sendMessage(message: string): void {
		// Create a new text packet.
		const packet = new Text();

		// Then set the packet's data.
		packet.type = ChatTypes.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = this.xuid;
		packet.platformChatId = '';

		// Return and send the packet to the player.
		return void this.session.send(packet);
	}

	public sendJukeboxPopup(message: string): void {
		// Create a new text packet.
		const packet = new Text();

		// Then set the packet's data.
		packet.type = ChatTypes.JukeboxPopup;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = [];
		packet.xuid = this.xuid;
		packet.platformChatId = '';

		// Return and send the packet to the player.
		return void this.session.send(packet);
	}

	public async broadcastMovement(mode: MoveMode, ...players: Player[]) {
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
			packet.riddenRuntimeId = 0n;
			packet.tick = 0n;
			await this.sendPacket(packet);
		}
	}

	public async sendPacket(packet: DataPacket): Promise<void> {
		return this.session.send(packet);
	}

	public sendToast(title: string, message: string): void {
		// Create a new toast packet.
		const packet = new ToastRequest();
		packet.Title = title;
		packet.Message = message;

		// Return and send the packet to the player.
		return void this.session.send(packet);
	}

	public sendTitle(
		title: string,
		subtitle: string,
		fadeInTime: number,
		stayTime: number,
		fadeOutTime: number,
		type: TitleTypes = TitleTypes.SetTitle,
	): void {
		// Create a new SetTitle packet.
		const packet = new SetTitle();
		packet.type = type;
		packet.text = title;
		packet.fadeInTime = fadeInTime;
		packet.stayTime = stayTime;
		packet.fadeOutTime = fadeOutTime;
		packet.xuid = this.xuid;
		packet.platformOnlineId = '';

		// Return and send the packet to the player.
		return void this.session.send(packet);
	}
}
export { Player };
