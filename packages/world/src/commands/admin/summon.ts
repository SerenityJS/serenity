import { CommandPermissionLevel, Vector3f } from "@serenityjs/protocol";

import { EntityEnum, PositionEnum } from "../enums";
import { Entity } from "../../entity";

import type { EntityIdentifier } from "@serenityjs/entity";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"summon",
		"Summons an entity at a specified location",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					entity: EntityEnum
				},
				(context) => {
					// Check if the origin is a dimension, if so, throw an error
					if (!(context.origin instanceof Entity))
						throw new Error(
							"You can't use this command in this context, try adding a position argument."
						);

					// Get the result of the entity
					const identifier = (context.entity.result as string).includes(":")
						? (context.entity.result as EntityIdentifier)
						: (`minecraft:${context.entity.result}` as EntityIdentifier);

					// Get the position of the entity
					const { x, y, z } = context.origin.position.floor();

					// Spawn the entity at the specified location
					context.origin.dimension.spawnEntity(
						identifier,
						new Vector3f(x, y, z)
					);

					// Send the success message
					return {
						message: `Successfully summoned entity at ${x}, ${y}, ${z}!`
					};
				}
			);

			// Create an overload for the command
			registry.overload(
				{
					entity: EntityEnum,
					position: PositionEnum
				},
				(context) => {
					// Get the result of the entity and position
					const identifier = (context.entity.result as string).includes(":")
						? (context.entity.result as EntityIdentifier)
						: (`minecraft:${context.entity.result}` as EntityIdentifier);
					const { x, y, z } = context.position.result as Vector3f;

					// Get the dimension based on the origin
					const dimension =
						context.origin instanceof Entity
							? context.origin.dimension
							: context.origin;

					// Summon the entity at the specified location
					dimension.spawnEntity(identifier, new Vector3f(x, y, z));
				}
			);
		},
		() => {}
	);
};

export default register;
