import { CommandPermissionLevel } from "@serenityjs/protocol";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commands.register(
    "save",
    "Save the current world's data to disk",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;
    },
    () => {
      // Save the world
      world.provider.onSave();

      // Return a message
      return {
        message: "World has been saved, check console for additional details."
      };
    }
  );
};

export default register;
