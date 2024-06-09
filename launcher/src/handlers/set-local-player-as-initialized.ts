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
import { type CustomEnum, SoftEnum } from "@serenityjs/command";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class SetLocalPlayerAsIntialized extends SerenityHandler {
	public static readonly packet = SetLocalPlayerAsInitializedPacket.id;

	public static handle(
		_packet: SetLocalPlayerAsInitializedPacket,
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

		// Send the player the spawn chunks
		// const chunks = player.dimension.getSpawnChunks();
		// player.sendChunk(...chunks);

		// Create a new available commands packet
		const packet = new AvailableCommandsPacket();

		// Get all the commands that the player can use according to their permission level.
		const commands = player.dimension.world.commands
			.getAll()
			.filter((command) => {
				return (
					!command.permission ||
					command.permission === PermissionLevel.Member ||
					command.permission === player.permission
				);
			});

		packet.dynamicEnums = [];

		// Map the commands to the packet property
		packet.commands = commands.map((command) => {
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
								const enm = Array.isArray(value) ? value[0] : value;

								// TODO: Clean this up
								// Get the name of the parameter.
								const symbol =
									enm.type === SoftEnum.type
										? (enm as typeof CustomEnum).options.length > 0
											? (0x4_10 << 16) |
												(packet.dynamicEnums.push({
													name: enm.name,
													values: (enm as typeof CustomEnum).options
												}) -
													1)
											: enm.symbol
										: enm.symbol;

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
			};
		});

		// Assign the remaining properties to the packet
		packet.chainedSubcommandValues = [];
		packet.subcommands = [];
		packet.enumConstraints = [];
		packet.enumValues = [];
		packet.enums = [];
		packet.postFixes = [];

		// Send the packet to the player
		session.sendImmediate(packet);

		// Send the player joined message
		player.dimension.sendMessage(`§e${player.username} joined the game.§r`);

		// Log the player joined message
		player.dimension.world.logger.info(
			`[${player.username}] Event: Player has joined the game.`
		);
	}
}

export { SetLocalPlayerAsIntialized };
