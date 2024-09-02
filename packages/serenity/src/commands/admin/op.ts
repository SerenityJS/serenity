import { type Player, TargetEnum, type World } from "@serenityjs/world";
import { PermissionLevel, CommandPermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"op",
		"Sets the operator status of a player",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum
				},
				(context) => {
					// Validate the target
					context.target.validate(true);

					// Get the targets from the context
					const targets = context.target.result as Array<Player>;

					// Loop through all the targets
					for (const player of targets) {
						// Check if the player is already an operator
						if (player.permission === PermissionLevel.Operator) continue;

						// Set the player as an operator
						serenity.permissions.set(player, PermissionLevel.Operator);

						// Log and send a message to the player
						player.sendMessage("§aYou have been set as an operator§r");
						serenity.logger.info(
							`§a${player.username} has been set as an operator§r`
						);

						// Set the player permission level
						player.permission = PermissionLevel.Operator;

						// Sync the player
						player.sync();
					}

					// Return the success message
					return {
						message: `§a${targets.length} player(s) have been set as operators§r`
					};
				}
			);
		},
		() => {}
	);
};

export default register;
