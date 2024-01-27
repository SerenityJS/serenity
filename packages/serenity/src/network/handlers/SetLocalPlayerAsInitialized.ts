import {
	DisconnectReason,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	PlayerList,
	RecordAction,
	SetEntityData,
	SetLocalPlayerAsInitialized,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = SetLocalPlayerAsInitialized.ID;

	public static override async handle(packet: SetLocalPlayerAsInitialized, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Add the player to the world.
		player.world.addPlayer(player);

		// TODO: Move elsewhere.
		const data = new SetEntityData<boolean>();
		data.runtimeEntityId = player.runtimeEntityId;
		data.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.AffectedByGravity,
			},
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.Breathing,
			},
		];
		data.properties = {
			ints: [],
			floats: [],
		};
		data.tick = BigInt(0);

		await session.send(data);
	}
}

export { SetLocalPlayerAsInitializedHandler };
