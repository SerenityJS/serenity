import { IntegerEnum, TimeOpertation } from "../enums";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commandPalette.register(
    "time",
    "Modifies the current time of day",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      registry.overload(
        {
          operation: TimeOpertation,
          value: [IntegerEnum, true]
        },
        (context) => {
          // Get the operation from the context
          const operation = context.operation.result as string;

          // Get the value from the context
          const value = context.value.result as number;

          // Switch the operation
          switch (operation) {
            case "set": {
              // Check if the value is not a number
              if (typeof value !== "number" || Number.isNaN(value) || value < 0)
                throw new Error(
                  "Invalid value for time of day, expected a positive integer"
                );

              // Set the time of day
              world.setTimeOfDay(value);

              // Return the message
              return {
                message: `§7Set the time of day to §u${value}§7.§r`,
                dayTime: value
              };
            }

            case "add": {
              // Check if the value is not a number
              if (typeof value !== "number" || Number.isNaN(value) || value < 0)
                throw new Error(
                  "Invalid value for time of day, expected a positive integer"
                );

              // Add the time of day
              world.setTimeOfDay(world.dayTime + value);

              // Return the message
              return {
                message: `§7Added §u${value}§7 to the current time of day.§r`,
                dayTime: world.dayTime
              };
            }

            case "query": {
              // Return the message
              return {
                message: `§7The current time of day is §u${world.dayTime}§7.§r`,
                dayTime: world.dayTime
              };
            }
          }
        }
      );
    },
    () => {}
  );
};

export default register;
