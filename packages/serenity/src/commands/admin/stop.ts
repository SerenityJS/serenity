import { Player, type World } from "@serenityjs/world";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"stop",
		"Shuts down the server (console only)",
		(registry) => {
			// Set the command to be an internal command
			registry.permissionLevel = CommandPermissionLevel.Internal;
		},
		(context) => {
			// Check if the origin is a player
			if (context.origin instanceof Player) {
				context.origin.sendMessage(
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
		}
	);
};

export default register;
