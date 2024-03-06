import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	DisconnectReason,
	AvailableCommands,
	SetLocalPlayerAsInitialized,
	PermissionLevel,
  Commands,
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

		// Spawn all the entities in the dimension.
		const entities = player.dimension.entities;
		for (const [, entity] of entities) {
			// Skip if the entity is the player.
			if (entity === player) continue;

			// When we provide a player to the spawn method,
			// It will send the spawn packet to the player, instead of broadcasting it to all players.
			entity.spawn(player);
		}

		const commands = new AvailableCommands();

		const avaliableCommands = [];
		for (const [name, command] of this.serenity.commandManager.getCommands().entries()) {
      const commandName = name.includes(':') ? name.split(':')[1] : name;
      
			avaliableCommands.push(
				new Commands(
					commandName,
					command.description,
					0,
					PermissionLevel.Member,
					0,
					[],
					[
						{
							chaining: false,
							parameters: [
								{
									enumType: 0x10,
									name: 'args',
									optional: true,
									options: 0,
									valueType: 44,
								},
							],
						},
					],
				),
			);
		}

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
      ...avaliableCommands
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
