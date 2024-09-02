import { type Player, TargetEnum, type World } from "@serenityjs/world";
import { CommandPermissionLevel, PermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"deop",
		"Removes the operator status of a player",
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
						// Check if the player is already an member
						if (player.permission === PermissionLevel.Member) continue;

						// Set the player as an member
						serenity.permissions.set(player, PermissionLevel.Member);

						// Log and send a message to the player
						player.sendMessage("§cYou are no longer an operator§r");
						serenity.logger.info(
							`§cPlayer ${player.username} has been deoped§r`
						);

						// Set the player permission level
						player.permission = PermissionLevel.Member;

						// Sync the player
						player.sync();
					}

					// Return the success message
					return {
						message: `§aSuccessfully deoped ${targets.length} player(s)§r`
					};
				}
			);
		},
		() => {}
	);
};

export default register;
