import { CommandPermissionLevel } from "@serenityjs/protocol";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commands.register(
    "stop",
    "Stops the server",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;
    },
    () => {
      // stop the server
      world.serenity.stop();
    }
  );
};

export default register;
