import { CommandPermissionLevel } from "@serenityjs/protocol";

import { TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
	// Register the kill command
	world.commands.register(
		"kill",
		"Kills entities (players, mobs, etc.).",
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
					const targets = context.target.result as Array<Entity>;

					// Check if there are no targets
					if (targets.length === 0)
						throw new Error("No targets matched the selector.");

					// Loop through all the targets
					for (const target of targets) target.kill();
				}
			);
		},
		() => {}
	);
};

export default register;
