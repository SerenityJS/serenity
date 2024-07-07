import { Player, TargetEnum, type World } from "@serenityjs/world";
import { CommandPermissionLevel, PermissionLevel } from "@serenityjs/protocol";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the about command
	world.commands.register(
		"deop",
		"Removes the operator status of a player",
		(_, paramaters) => {
			// Get the targets
			const targets = paramaters.target.result;

			// Filter the targets to only players
			const players = targets.filter((target) => target instanceof Player);

			// Loop through all the targets
			for (const player of players) {
				// Sanity check
				if (!(player instanceof Player)) continue;

				// Check if the player is already an member
				if (player.permission === PermissionLevel.Member) continue;

				// Set the player as an member
				serenity.permissions.set(player, PermissionLevel.Member);

				// Log and send a message to the player
				player.sendMessage("§cYou are no longer an operator§r");
				serenity.logger.info(`§cPlayer ${player.username} has been deoped§r`);

				// Set the player permission level
				player.permission = PermissionLevel.Member;

				// Sync the player
				player.sync();
			}

			// Return the success message
			return {
				message: `§aSuccessfully deoped ${players.length} player(s)§r`
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
