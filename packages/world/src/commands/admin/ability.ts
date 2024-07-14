import { type AbilitySet, CommandPermissionLevel } from "@serenityjs/protocol";

import { AbilityEnum, BoolEnum, TargetEnum } from "../enums";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"ability",
		"Sets the ability of a player",
		(_, parameters) => {
			// Iterate over the entities
			for (const entity of parameters.target.result) {
				// Check if the entity is a player
				if (!entity.isPlayer()) continue;

				// Get the ability from the parameters
				const ability = parameters.ability.result as AbilitySet;

				// Get the ability component
				const component = entity.getComponent(ability);

				// Get the enabled value from the parameters
				const enabled = parameters.enabled.result === "true";

				// Set the ability value
				component.setCurrentValue(enabled);
			}

			return {
				message: "Successfully set the ability of the targeted players."
			};
		},
		{
			target: TargetEnum,
			ability: AbilityEnum,
			enabled: BoolEnum
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
