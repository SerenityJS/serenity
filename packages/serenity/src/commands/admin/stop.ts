import { Player, type World } from "@serenityjs/world";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"stop",
		"Shuts down the server (console only)",
		(origin) => {
			// Check if the origin is a player
			if (origin instanceof Player) {
				origin.sendMessage(
					"§cThis command can only be executed from the console§r"
				);
				return;
			} else {
				// Stop the server
				void serenity.stop();

				return {
					message: "§aServer is shutting down...§r"
				};
			}
		},
		{},
		{
			permission: CommandPermissionLevel.Internal
		}
	);
};

export default register;
