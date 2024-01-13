import { AbilityLayerFlag, type Vec2f, type Vec3f } from '@serenityjs/bedrock-protocol';
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
}

export { Player };
