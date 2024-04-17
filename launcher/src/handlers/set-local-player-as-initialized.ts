import {
	AvailableCommandsPacket,
	Commands,
	DisconnectReason,
	PermissionLevel,
	SetLocalPlayerAsInitializedPacket,
	CommandParameterType
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

		const avaliableCommands = [];
		for (const [name, command] of this.serenity.commands
			.getCommands()
			.entries()) {
			const commandName = name.includes(":") ? name.split(":")[1] : name;

			avaliableCommands.push(
				new Commands(
					commandName as string,
					command.description,
					0,
					PermissionLevel.Member,
					CommandParameterType.Command,
					[],
					[
						{
							chaining: false,
							parameters: [
								{
									enumType: 0x10,
									name: "args",
									optional: true,
									options: 0,
									valueType: CommandParameterType.RawText
								}
							]
						}
					]
				)
			);
		}

		commands.commands = [
			{
				name: "test",
				description: "Test command",
				permissionLevel: PermissionLevel.Member,
				subcommands: [],
				flags: 87,
				overloads: [
					{
						chaining: false,
						parameters: [
							{
								enumType: 0x10,
								name: "param",
								optional: false,
								options: 0,
								valueType: CommandParameterType.RawText
							},
							{
								enumType: 0x10,
								name: "param2",
								optional: false,
								options: 0,
								valueType: CommandParameterType.Target
							}
						]
					}
				],
				alias: 0
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

export { SetLocalPlayerAsIntialized };
