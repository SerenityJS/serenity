import { IntegerEnum } from "@serenityjs/command";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { ItemEnum, TargetEnum } from "../enums";
import { ItemStack } from "../../item";

import type { ItemIdentifier } from "@serenityjs/item";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"give",
		"Gives an item to a player",
		(_, parameters) => {
			// Get the result of the item, amount, and metadata
			const itemIdentifier = parameters.item.result as ItemIdentifier;
			const amount = parameters.amount?.result ?? 1;
			const metadata = parameters.metadata?.result ?? 0;

			// Create a new item stack
			const itemStack = new ItemStack(itemIdentifier, amount, metadata);

			// Loop through the targets
			for (const target of parameters.target.result) {
				// Check if the target is an entity
				if (!target.isPlayer()) continue;

				// Get the player's inventory
				const { container } = target.getComponent("minecraft:inventory");

				// Add the item to the player's inventory
				container.addItem(itemStack);
			}

			// Send the success message
			return {
				message: `Successfully gave x${amount} ${itemIdentifier} to ${parameters.target.result.length} players.`
			};
		},
		{
			target: TargetEnum,
			item: ItemEnum,
			amount: [IntegerEnum, true],
			metadata: [IntegerEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
