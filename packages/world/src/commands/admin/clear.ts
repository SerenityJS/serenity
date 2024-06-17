import { PermissionLevel } from "@serenityjs/protocol";
import type { World } from "../../world";
import { ItemEnum, TargetEnum } from "../enums";
import { IntegerEnum } from "@serenityjs/command";
import { Player } from "../../player";

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

      if (targets.length < 1) return { message: "No targets matched selector" };
      for (const player of targets) {
        if (!(player instanceof Player)) continue;
        const { container } = player.getComponent("minecraft:inventory");

        if (!itemName) {
          container.storage.map((item, idx) => {
            if (!item) return;
            itemCount += item?.amount;
            container.clearSlot(idx);
          });
          continue;
        }
        const itemSlots = container.storage
          .map((item, slot) => ({ item, slot }))
          .filter(({ item }) => item?.type.identifier === itemName && item?.metadata === itemMetadata && item);

        for (const itemSlot of itemSlots) {
          const { item } = itemSlot;

          if (!item) continue;
          const { amount } = item;
          const remaining = amount - itemAmount;
          item!.setAmount(Math.max(remaining, 0));

          itemCount += remaining < 0 ? amount : itemAmount;
          itemAmount -= amount;
          if (itemAmount < 0) break;
        }
      }
      return {
        message: `Cleared the inventory of ${targets.map((target) => (target as Player).username).join(", ")}, removing ${itemCount} items`,
      };
    },
    {
      player: [TargetEnum, true],
      itemName: [ItemEnum, true],
      data: [IntegerEnum, true],
      maxCount: [IntegerEnum, true],
    },
    {
      permission: PermissionLevel.Operator,
    }
  );
};

export default register;
