---
 title: Registering a Command
 group: Documents
---

# Introduction
Serenity provides powerful tools for custom command registration that can be used in your server instance. This guide will walk you through the process of creating a custom command, including defining its properties, and overloads.

## Registering a Command
When using SerenityJS, commands are bound per-world. This means worlds can have a seperate set of commands that meet the purpose for that world. To register a command, you need to first determine which world you want to register the command to. This is done by accessing the `commandPalette` property of the world instance. Below is an example of how to create a simple custom command.

> **In these example we will be creating a function that needs a `World` instance to register the command to.**

In this example, we will create a simple command called `ping`, which will respond with "Pong!" when executed. This command does not take any arguments, and will work when executed by any command sender.

```typescript
import { World } from "@serenityjs/core";

// Function to register a command for a given world
function register(world: World): void {
  // In this example, we will register a simple command called "ping",
  // This command will respond with "Pong!" when executed.

  // Commands are registered using the "commandPalette" property of the world instance.
  world.commandPalette.register(
    "ping", // The name of the command.
    "Ping the server to check if it's responsive.", // A brief description of the command.
    // The default executor function when no overloads are matched.
    () => {
      return {
        message: "Pong!"
      };
    }
  );
}
```

In the next example, we will assign additional permissions to the command. Serenity provides a permission system that allows you to restrict access to commands based on the command sender's permissions. In this example, we will restrict the `ping` command to only be executed by players with the `example.ping` permission.

```typescript
import { World } from "@serenityjs/core";

// Function to register a command for a given world
function register(world: World): void {
  // In this example, we will register a simple command called "ping",
  // This command will respond with "Pong!" when executed.

  // Commands are registered using the "commandPalette" property of the world instance.
  world.commandPalette.register(
    "ping", // The name of the command.
    "Ping the server to check if it's responsive.", // A brief description of the command.
    // This function is known as the registry function.
    // It allows you to define additional properties for the command,
    // as well as overloads for different argument structures.
    (registry) => {
      // Assign a permission to use this command.
      registry.permissions = ["example.ping"];

      // The registry object also allows you to mark the command as debug.
      // This means the command will appear blue in the in-game command list.
      // Functionally, this does not change anything.
      registry.debug = true;
    },
    // The default executor function when no overloads are matched.
    () => {
      return {
        message: "Pong!"
      };
    }
  );
}
```

In the next example, we will create a command that has an overload. Overloads allow you to define different argument structures for a command. This means you can have multiple ways to execute the same command, each with its own set of arguments. In this example, we will create an overload for the `ping` command that takes a single string argument called `target`. When the command is executed with this argument, it will respond with "Pong, {target}!".

```typescript
import { TargetEnum, World } from "@serenityjs/core";

// Function to register a command for a given world
function register(world: World): void {
  // In this example, we will register a simple command called "ping",
  // This command will respond with "Pong!" when executed.

  // Commands are registered using the "commandPalette" property of the world instance.
  world.commandPalette.register(
    "ping", // The name of the command.
    "Ping the server to check if it's responsive.", // A brief description of the command.
    // This function is known as the registry function.
    // It allows you to define additional properties for the command,
    // as well as overloads for different argument structures.
    (registry) => {
      // Assign a permission to use this command.
      registry.permissions = ["example.ping"];

      // The registry object also allows you to mark the command as debug.
      // This means the command will appear blue in the in-game command list.
      // Functionally, this does not change anything.
      registry.debug = true;

      // Register an overload for the command.
      registry.overload(
        {
          // We define a single argument called "target".
          // You can find a list of all available argument types at: https://www.serenityjs.net/classes/_serenityjs_core.Enum.html
          target: [TargetEnum, false] // False indicates that the argument is NOT optional.
        },
        // The executor function for this overload.
        ({ target }) => {
          // Validate the target argument.
          if (!target.result || target.result?.length > 1) {
            // Throw an error if the argument is invalid.
            throw new Error(
              "Invalid target argument, expected a single value."
            );
          }

          // Get the value of the target argument.
          const value = target.result[0].isPlayer()
            ? target.result[0].username
            : target.result[0].type.identifier;

          // Return the response message.
          return {
            message: `Pong, ${value}!`
          };
        }
      );
    },
    // The default executor function when no overloads are matched.
    () => {
      return {
        message: "Pong!"
      };
    }
  );
}
```

In this next example, we will create a command that uses a custom enum for an argument, as well as a target argument. This command will also demonstrate how to use the `origin` property of the command context to get information about the command sender. In this example, we will create a command called `kit` that gives `beginner | intermediate | professional` item kit to a `target` argument.

```typescript
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
```

## Conclusion
In this guide, we have covered the basics of registering a command in Serenity. We have registered a simple command, added permissions, created overloads, and used custom enums for arguments. You can use these techniques to create powerful and flexible commands for your server.

If you are interested in the full code snippet, you can find it [here](https://github.com/SerenityJS/serenity/tree/main/docs/custom-command/code.ts)!