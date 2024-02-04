import {
	DisconnectReason,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	PlayerList,
	RecordAction,
	SetEntityData,
	AvailableCommands,
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
		player.getWorld().addPlayer(player);

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
		const avCommands = new AvailableCommands();
		avCommands.CommandDefinition = {
			command_data: [
				{
					name: 'test',
					alias: 0,
					chained_subcommand_offsets: [],
					description: 'Description',
					flags: 0,
					overloads: [
						{
							chaining: false,
							parameters: [
								{
									enum_type: 0x30,
									name: '<bob>',
									optional: false,
									options: 5,
									type: 0,
								},
							],
						},
					],
					permission_level: 0,
				},
			],
			chained_subcommand_values: [],
			chained_subcommands: [],
			dynamic_enums: [],
			enum_constraints: [],
			enum_values: ['test', 'testenum2'],
			enums: [
				{
					name: 'bob',
					values: [0, 1],
				},
			],
			suffixes: [],
		};
		await session.send(data, avCommands);
	}
}

export { SetLocalPlayerAsInitializedHandler };
