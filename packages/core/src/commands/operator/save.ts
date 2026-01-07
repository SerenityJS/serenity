import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commandPalette.register(
    "save",
    "Save the current world's data to disk",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.internal"];
    },
    async () => {
      // Get the start time
      const start = Date.now();

      // Save the world
      await world.provider.onSave();

      // Get the end time
      const end = Date.now();

      // Return a message
      return {
        message: `World saved in ${end - start}ms.`
      };
    }
  );
};

export default register;
