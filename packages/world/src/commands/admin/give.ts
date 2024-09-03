import { IntegerEnum } from "@serenityjs/command";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { ItemEnum, TargetEnum } from "../enums";
import { ItemStack } from "../../item";

import type { Entity } from "../../entity";
import type { ItemIdentifier } from "@serenityjs/item";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"give",
		"Gives an item to a player",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum,
					item: ItemEnum,
					amount: [IntegerEnum, true],
					metadata: [IntegerEnum, true]
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get the result of the item, amount, and metadata
					const itemResult = context.item.result as string;
					const itemIdentifier = itemResult.includes(":")
						? itemResult
						: `minecraft:${itemResult}`;
					const amount = context.amount?.result ?? 1;
					const metadata = context.metadata?.result ?? 0;

					// Create a new item stack
					const itemStack = new ItemStack(
						itemIdentifier as ItemIdentifier,
						amount,
						metadata
					);

					// Loop through the targets
					for (const target of targets) {
						// Check if the target is an entity
						if (!target.isPlayer()) continue;

						// Get the player's inventory
						const { container } = target.getComponent("minecraft:inventory");

						// Add the item to the player's inventory
						container.addItem(itemStack);
					}

					// Send the success message
					return {
						message: `Successfully gave x${amount} ${itemIdentifier} to ${targets.length} players.`
					};
				}
			);
		},
		() => {}
	);
};

export default register;
