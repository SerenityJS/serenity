import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commandPalette.register(
    "stop",
    "Stops the server",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.internal"];
    },
    () => {
      // stop the server
      world.serenity.stop();
    }
  );
};

export default register;
