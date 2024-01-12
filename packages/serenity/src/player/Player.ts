import type { Serenity } from '../Serenity';
import type { Network, NetworkSession } from '../network';
import type { LoginTokenData } from '../types';

class Player {
	protected readonly serenity: Serenity;
	public readonly network: Network;
	public readonly session: NetworkSession;

	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;

	public constructor(session: NetworkSession, tokens: LoginTokenData) {
		this.serenity = session.serenity;
		this.network = session.network;
		this.session = session;

		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = session.guid;
	}
}

export { Player };
