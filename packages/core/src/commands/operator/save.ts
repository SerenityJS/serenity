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
      // Save the world
      await world.provider.onSave();

      // Return a message
      return {
        message: "World has been saved, check console for additional details."
      };
    }
  );
};

export default register;
