import { DisconnectReason, CommandPermissionLevel } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import { TargetEnum } from "../enums";
import { Player } from "../../player";

import type { Entity } from "../../entity";
import type { World } from "../../world";

const register = (world: World) => {
	world.commands.register(
		"kick",
		"Kicks a player from the server",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum,
					reason: [StringEnum, true]
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get the kick reason from the context
					const reason = context.reason?.result ?? "Kicked by an operator.";

					// Check if there are no targets
					if (targets.length === 0)
						throw new Error("No targets matched the selector.");

					// Loop through all the targets
					for (const target of targets) {
						// Check if the target is not a player
						if (!(target instanceof Player)) continue;

						// Kick the player
						target.session.disconnect(reason, DisconnectReason.Kicked, false);
					}
				}
			);
		},
		() => {}
	);
};

export default register;
