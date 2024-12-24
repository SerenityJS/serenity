import { CommandPermissionLevel } from "@serenityjs/protocol";

import { IntegerEnum, TimeOpertation } from "../enums";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the stop command
  world.commands.register(
    "time",
    "Modifies the current time of day",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

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
              if (!value)
                throw new Error(
                  "Invalid value for time of day, expected a integer"
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
              if (!value)
                throw new Error(
                  "Invalid value for time of day, expected a integer"
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
