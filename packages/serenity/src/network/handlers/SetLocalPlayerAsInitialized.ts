import {
	DisconnectReason,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	PlayerList,
	RecordAction,
	SetEntityData,
	type SetLocalPlayerAsInitialized,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
	public static override async handle(packet: SetLocalPlayerAsInitialized, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Send the player list to the client.
		const players = [...this.serenity.players.values()].filter((x) => x !== player);

		// Construct the player list packet.
		const list = new PlayerList();

		// Add the fields to the packet.
		list.action = RecordAction.Add;
		list.records = players.map((player) => ({
			uuid: player.uuid,
			entityUniqueId: player.uniqueId,
			username: player.username,
			xuid: player.xuid,
			platformChatId: '', // ?? dont know what this is
			buildPlatform: 0, // ?? dont know what this is
			skin: player.skin.serialize(),
			isTeacher: false,
			isHost: false,
		}));

		// Send the packet.
		await session.send(list);

		player.world.sendMessage(`§e${player.username} joined the server.`);

		const data = new SetEntityData<any>();
		data.runtimeEntityId = player.runtimeId;
		data.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: BigInt(0),
				flag: MetadataFlags.AffectedByGravity,
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
