import { DisconnectReason, PermissionLevel } from "@serenityjs/protocol";
import type { World } from "../../world";
import { TargetEnum } from "../enums";
import { Player } from "../../player";
import { StringEnum } from "@serenityjs/command";

const register = (world: World) => {
  world.commands.register(
    "kick",
    "Kicks a player from the server",
    (origin, parameters) => {
      const targets = parameters.name.result;
      const kickReason = parameters.reason?.result ?? "Kicked by an operator.";

      if (targets.length < 1) return { message: "No targets matched selector" };

      for (const target of targets) {
        if (!(target instanceof Player)) continue;
        if (origin instanceof Player && origin.xuid == target.xuid) continue;
        target.session.disconnect(kickReason, DisconnectReason.Kicked, false);
      }
      return {
        message: `Kicked ${targets.map((target) => (target as Player).username).join(", ")} from the game`,
      };
    },
    {
      name: TargetEnum,
      reason: [StringEnum, true],
    },
    {
      permission: PermissionLevel.Operator,
    }
  );
};

export default register;
