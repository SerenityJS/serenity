import { type Entity, TargetEnum, type World } from "@serenityjs/world";
import { CommandPermissionLevel } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import { WorldsEnum } from "../enums";

import type { Serenity } from "../../serenity";

const register = (world: World, serenity: Serenity) => {
	// Register the world command
	world.commands.register(
		"world",
		"Changes a target's current world",
		(registry) => {
			// Set the command to be an internal command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Register the overload for the command
			registry.overload(
				{
					target: TargetEnum,
					world: WorldsEnum,
					dimension: [StringEnum, true]
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get the world identifier from the context
					const worldId = context.world.result as string;

					// Check if the world identifier is valid
					if (!serenity.worlds.entries.has(worldId))
						throw new Error(`World "${worldId}" does not exist.`);

					// Get the world from the identifier
					const world = serenity.worlds.entries.get(worldId) as World;

					// Get the dimension identifier from the context
					const dimensionId = context.dimension.result
						? (context.dimension.result as string)
						: world.getDimension().identifier;

					// Check if the dimension exists
					if (!world.dimensions.has(dimensionId))
						throw new Error(
							`Dimension "${dimensionId}" does not exist for world "${worldId}".`
						);

					// Get the dimension from the identifier
					const dimension = world.dimensions.get(dimensionId);

					// Prepare the message
					const messages: Array<string> = [];

					// Change the target's world
					for (const target of targets) {
						// Check if the target dimension is the same as the new dimension
						if (target.dimension === dimension) {
							// Add the message to the messages
							messages.push(
								`§7Target §c${target.isPlayer() ? target.username : target.unique}§7 is already in §a${worldId}§7 in §a${dimensionId}§7.§r`
							);

							// Skip to the next target
							continue;
						}

						// Teleport the target to the new world
						target.teleport(target.position, dimension);

						// Add the message to the messages
						messages.push(
							`§7Successfully changed world for §c${target.isPlayer() ? target.username : target.unique}§7 to §a${worldId}§7 in §a${dimensionId}§7.§r`
						);
					}

					// Return the messages
					return { message: messages.join("\n") };
				}
			);
		},
		() => {
			// Check if the origin is a player
			return { message: "No overloads matched for the specified command." };
		}
	);
};

export default register;
