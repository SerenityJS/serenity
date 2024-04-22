import {
	AvailableCommandsPacket,
	DisconnectReason,
	PermissionLevel,
	SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import {
	EntityAlwaysShowNametagComponent,
	EntityNametagComponent
} from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class SetLocalPlayerAsIntialized extends SerenityHandler {
	public static readonly packet = SetLocalPlayerAsInitializedPacket.id;

	public static handle(
		packet: SetLocalPlayerAsInitializedPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Spawn the player in the dimension
		player.spawn();

		// Set the player ability values
		for (const ability of player.getAbilities()) {
			// Reset the ability to the default value
			ability.resetToDefaultValue();
		}

		// Set the player attribute values
		for (const attribute of player.getAttributes()) {
			// Reset the attribute to the default value
			attribute.resetToDefaultValue();
		}

		// Set the player metadata values
		for (const metadata of player.getMetadatas()) {
			// Check if the component is nametag
			// And check for always show nametag
			if (metadata instanceof EntityNametagComponent) {
				// Set the default value to the player's username
				metadata.defaultValue = player.username;
			} else if (metadata instanceof EntityAlwaysShowNametagComponent) {
				// Set the default value to true
				metadata.defaultValue = true;
			}

			// Reset the metadata to the default value
			metadata.resetToDefaultValue();
		}

		// Spawn the current entities that are in the dimension
		for (const [, entity] of player.dimension.entities) {
			// Check if the entity is the player,
			// if so then skip the entity.
			if (entity === player) continue;

			// Spawn the entity for the player
			entity.spawn(player);
		}

		// Send the player the spawn chunks
		const chunks = player.dimension.getSpawnChunks();
		player.sendChunk(...chunks);

		const commands = new AvailableCommandsPacket();

		commands.commands = [
			...player.dimension.world.commands.entries.values()
		].map((command) => {
			return {
				name: command.name,
				description: command.description,
				permissionLevel: command.permission ?? PermissionLevel.Member,
				subcommands: [],
				flags: command.special ? 1 : 0,
				alias: -1,
				overloads: [
					{
						chaining: false,
						parameters: Object.entries(command.parameters).map(
							([name, value]) => {
								// Get the parameter constuctor by checking if the value is an array.
								const { symbol } = Array.isArray(value) ? value[0] : value;

								// Check if the parameter is optional.
								const optional = Array.isArray(value) ? value[1] : false;

								return {
									symbol,
									name,
									optional,
									options: 0
								};
							}
						)
					}
				]
				// overloads: [
				// 	{
				// 		chaining: false,
				// 		parameters: [
				// 			{
				// 				valueType: 4,
				// 				enumType: 0x10,
				// 				name: "param",
				// 				optional: false,
				// 				options: 0
				// 			},
				// 			{
				// 				valueType: 4,
				// 				enumType: 0x10,
				// 				name: "param2",
				// 				optional: false,
				// 				options: 0
				// 			}
				// 		]
				// 	}
				// ]
			};
		});

		commands.chainedSubcommandValues = [];
		commands.subcommands = [];
		commands.dynamicEnums = [];
		commands.enumConstraints = [];
		commands.enumValues = [];
		commands.enums = [];
		commands.postFixes = [];
		// 	{
		// 		name: "test",
		// 		description: "Test command",
		// 		permissionLevel: PermissionLevel.Member,
		// 		subcommands: [],
		// 		flags: 0,
		// 		alias: -1,
		// 		overloads: [
		// 			{
		// 				chaining: false,
		// 				parameters: [
		// 					{
		// 						valueType: 44,
		// 						enumType: 16,
		// 						name: "name",
		// 						optional: false,
		// 						options: 0
		// 					}
		// 				]
		// 			}
		// 		]
		// 	}
		// 	// ...avaliableCommands
		// ];

		// commands.chainedSubcommandValues = [];
		// commands.subcommands = [];
		// commands.dynamicEnums = [];
		// commands.enumConstraints = [];
		// commands.enumValues = [];
		// commands.enums = [];
		// commands.postFixes = [];

		session.sendImmediate(commands);
	}
}

export { SetLocalPlayerAsIntialized };
