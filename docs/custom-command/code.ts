import { CustomEnum, Player, TargetEnum, World } from "@serenityjs/core";

// Create a custom enum for the kit argument
class KitEnum extends CustomEnum {
  public static readonly identifier = "kit_enum";
  public static readonly options = ["beginner", "intermediate", "professional"];
}

// Function to register a command for a given world
function register(world: World): void {
  // In this example, we will register a simple command called "kit",
  // this command will give an item kit to a player.

  // Commands are registered using the "commandPalette" property of the world instance.
  world.commandPalette.register(
    "kit", // The name of the command.
    "Give a kit to a player.", // A brief description of the command.
    // This function is known as the registry function.
    // It allows you to define additional properties for the command,
    // as well as overloads for different argument structures.
    (registry) => {
      // Assign a permission to use this command.
      registry.permissions = ["serenity.operator"];

      // Register an overload for the command.
      registry.overload(
        {
          target: TargetEnum, // The player(s) to give the kit to.
          kit: KitEnum // The kit to give.
        },
        // The executor function for this overload.
        ({ origin, target, kit }) => {
          // Verify the command sender is a player.
          if (!(origin instanceof Player)) {
            // Throw an error if the command sender is not a player.
            throw new Error("Only players can use this command.");
          }

          // Prepare a give count variable.
          let giveCount = 0;

          // Iterate over the target argument.
          for (const entity of target.result ?? []) {
            // Verify the entity is a player.
            if (!entity.isPlayer()) continue;

            // Switch over the kit argument.
            switch (kit.result) {
              default:
                break;

              case "beginner": {
                // Give the beginner kit.
                entity.executeCommand("give @s minecraft:wooden_sword 1");
                entity.executeCommand("give @s minecraft:apple 5");
                entity.executeCommand("give @s minecraft:leather_chestplate 1");
                break;
              }

              case "intermediate": {
                // Give the intermediate kit.
                entity.executeCommand("give @s minecraft:stone_sword 1");
                entity.executeCommand("give @s minecraft:apple 25");
                entity.executeCommand("give @s minecraft:iron_chestplate 1");
                break;
              }

              case "professional": {
                // Give the professional kit.
                entity.executeCommand("give @s minecraft:diamond_sword 1");
                entity.executeCommand("give @s minecraft:apple 64");
                entity.executeCommand("give @s minecraft:diamond_chestplate 1");
                break;
              }
            }

            // Increment the give count.
            giveCount++;
          }

          // Return the response message.
          return {
            message: `Gave the ${kit.result} kit to ${giveCount} player(s).`
          };
        }
      );
    },
    // The default executor function when no overloads are matched.
    () => {
      throw new Error("Invalid arguments, please specify a target and kit.");
    }
  );
}

export { register };