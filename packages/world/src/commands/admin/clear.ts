import { IntegerEnum } from "@serenityjs/command";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { ItemEnum, TargetEnum } from "../enums";

import type { Entity } from "../../entity";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the clear command
	world.commands.register(
		"clear",
		"Clears items from player inventory.",
		(registry) => {
			// Set the command to be an operator command
			registry.permissionLevel = CommandPermissionLevel.Operator;

			// Create an overload for the command
			registry.overload(
				{
					target: TargetEnum,
					item: [ItemEnum, true],
					metadata: [IntegerEnum, true],
					amount: [IntegerEnum, true]
				},
				(context) => {
					// Get the targets from the context
					const targets = context.target.result as Array<Entity>;

					// Get the result of the item, amount, and metadata
					const itemResult = context.item?.result as string | undefined;
					const itemIdentifier = itemResult
						? `${itemResult.includes(":") ? "" : "minecraft:"}${itemResult}`
						: undefined;
					const itemMetadata = context.metadata?.result ?? 0;
					const itemAmount = context.amount?.result;
					let itemCount = 0;

					if (targets.length === 0) {
						return { message: "No targets matched selector" };
					}

					for (const target of targets) {
						if (!target.hasComponent("minecraft:inventory")) continue;
						const { container } = target.getComponent("minecraft:inventory");

						if (!itemResult) {
							container.clear();
							continue;
						}

						for (const [slot, itemStack] of Object.entries(container.storage)) {
							if (
								!itemStack ||
								(itemStack.type.identifier !== itemIdentifier &&
									itemStack.metadata !== itemMetadata)
							) {
								continue;
							}

							const stackAmount = itemStack.amount;
							const remaining = stackAmount - (itemAmount ?? 1);

							if (remaining < 0) {
								container.clearSlot(Number.parseInt(slot));
								itemCount += stackAmount;
							} else {
								itemStack.setAmount(Math.max(remaining, 0));
								itemCount += Math.min(itemAmount ?? 1, stackAmount);
							}

							if (itemCount >= (itemAmount ?? 1)) break;
						}
					}

					return {
						message: `Cleared the inventory of ${targets.length} entities`
					};
				}
			);
		},
		() => {}
	);
};

export default register;
