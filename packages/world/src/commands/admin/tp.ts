import { CommandPermissionLevel, type Vector3f } from "@serenityjs/protocol";

import { PositionEnum, TargetEnum } from "../enums";

import type { Entity } from "../../entity";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"tp",
		"Teleports an entity to a specified location",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum,
					position: PositionEnum
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get the position from the context
					const position = context.position.result as Vector3f;

					// Loop through all the targets
					for (const target of targets) {
						// Teleport the entity to the new location
						target.teleport(position);
					}
				}
			);
		},
		() => {}
	);
};

export default register;
