import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	DisconnectReason,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	SetEntityData,
	AvailableCommands,
	SetLocalPlayerAsInitialized,
	AddPlayer,
	PermissionLevel,
	CommandPermissionLevel,
	AbilityLayerFlag,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = SetLocalPlayerAsInitialized.ID;

	public static override handle(packet: SetLocalPlayerAsInitialized, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		const commands = new AvailableCommands();

		commands.commands = [
			{
				name: 'test',
				description: 'Test command',
				permissionLevel: PermissionLevel.Member,
				subcommands: [],
				flags: 0,
				overloads: [
					{
						chaining: false,
						parameters: [
							{
								enumType: 0x10,
								name: 'param',
								optional: false,
								options: 0,
								valueType: 44,
							},
							{
								enumType: 0x10,
								name: 'param2',
								optional: false,
								options: 0,
								valueType: 8,
							},
						],
					},
				],
				alias: 0,
			},
		];

		commands.subcommandValues = [];
		commands.subcommands = [];
		commands.dynamicEnums = [];
		commands.enumConstraints = [];
		commands.enumValues = [];
		commands.enums = [];
		commands.suffixes = [];

		session.send(commands);
	}
}

export { SetLocalPlayerAsInitializedHandler };
