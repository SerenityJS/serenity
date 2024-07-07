import { CommandPermissionLevel } from "@serenityjs/protocol";
import { IntegerEnum } from "@serenityjs/command";

import { ItemEnum, TargetEnum } from "../enums";
import { Player } from "../../player";

import type { World } from "../../world";

const register = (world: World) => {
	world.commands.register(
		"clear",
		"Clears items from player inventory.",
		(origin, parameters) => {
			const targets = parameters.player?.result ?? [origin];
			const itemName = parameters.itemName?.result;
			const itemMetadata = parameters.data?.result ?? 0;
			let itemAmount = parameters.maxCount?.result ?? Infinity;
			let itemCount = 0;

			if (targets.length === 0)
				return { message: "No targets matched selector" };
			for (const player of targets) {
				if (!(player instanceof Player)) continue;
				const { container } = player.getComponent("minecraft:inventory");

				if (!itemName) {
					container.storage.map((item, index) => {
						if (!item) return;
						itemCount += item?.amount;
						container.clearSlot(index);
					});
					continue;
				}
				const itemSlots = container.storage
					.map((item, slot) => ({ item, slot }))
					.filter(
						({ item }) =>
							item?.type.identifier === itemName &&
							item?.metadata === itemMetadata &&
							item
					);

				for (const itemSlot of itemSlots) {
					const { item } = itemSlot;

					if (!item) continue;
					const { amount } = item;
					const remaining = amount - itemAmount;
					item.setAmount(Math.max(remaining, 0));

					itemCount += remaining < 0 ? amount : itemAmount;
					itemAmount -= amount;
					if (itemAmount < 0) break;
				}
			}
			return {
				message: `Cleared the inventory of ${targets.map((target) => (target as Player).username).join(", ")}, removing ${itemCount} items`
			};
		},
		{
			player: [TargetEnum, true],
			itemName: [ItemEnum, true],
			data: [IntegerEnum, true],
			maxCount: [IntegerEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
