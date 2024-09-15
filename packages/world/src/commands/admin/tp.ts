import { CommandPermissionLevel, type Vector3f } from "@serenityjs/protocol";

import { PositionEnum, TargetEnum } from "../enums";
import { Dimension, type World } from "../../world";

import type { Entity } from "../../entity";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"tp",
		"Teleports an entity to a specified location",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			registry.overload(
				{
					position: PositionEnum
				},
				(context) => {
					// Get the origin from the context
					const origin = context.origin;

					// Check if the origin is a dimension
					if (origin instanceof Dimension)
						return {
							message: "This command can only be executed by entities"
						};

					// Get the position from the context
					const position = context.position.result as Vector3f;

					// Teleport the entity to the new location
					origin.teleport(position);
				}
			);

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
