import { Player, TargetEnum, type World } from "@serenityjs/world";
import { PermissionLevel, CommandPermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"op",
		"Sets the operator status of a player",
		(_, paramaters) => {
			// Get the targets
			const targets = paramaters.target.result;

			// Filter the targets to only players
			const players = targets.filter((target) => target instanceof Player);

			// Loop through all the targets
			for (const player of players) {
				// Sanity check
				if (!(player instanceof Player)) continue;

				// Check if the player is already an operator
				if (player.permission === PermissionLevel.Operator) continue;

				// Set the player as an operator
				serenity.permissions.set(player, PermissionLevel.Operator);

				// Log and send a message to the player
				player.sendMessage(`§aYou have been set as an operator.§r`);
				serenity.logger.info(
					`§a${player.username} has been set as an operator.§r`
				);

				// Set the player permission level
				player.permission = PermissionLevel.Operator;

				// Sync the player
				player.sync();
			}

			// Return the success message
			return {
				message: `§a${players.length} player(s) have been set as operators§r`
			};
		},
		{
			target: TargetEnum
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
