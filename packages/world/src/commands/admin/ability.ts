import { AbilityIndex, CommandPermissionLevel } from "@serenityjs/protocol";
import { BooleanEnum } from "@serenityjs/command";

import { TargetEnum } from "../enums";
import { AbilityEnum } from "../enums/ability";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
	// Register the kill command
	world.commands.register(
		"ability",
		"Update an ability for a specified player.",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum,
					ability: AbilityEnum,
					enabled: BooleanEnum
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get ability from the context
					const index = context.ability.result as string;
					const ability = AbilityIndex[index as keyof typeof AbilityIndex];

					// Get the enabled from the context
					const enabled = context.enabled.result as boolean;

					// Prepare the message to send to the origin
					const message = [];

					// Loop through the targets
					for (const entity of targets) {
						// Check if the entity is a player
						if (!entity.isPlayer()) {
							// Push the message to the array
							message.push(`§7Entity §c${entity.unique}§7 is not a player.`);

							// Skip the entity
							continue;
						}

						// Update the ability for the entity
						entity.setAbility(ability, enabled);

						// Get the nametag of the entity
						const nametag = entity.getNametag();

						// Push the message to the array
						message.push(
							`§7Updated ability §a${index}§7 to §c${enabled}§7 for §c${nametag ?? entity.unique}§7`
						);
					}

					// Send the message to the origin
					return {
						message: message.join("\n")
					};
				}
			);
		},
		() => {}
	);
};

export default register;
