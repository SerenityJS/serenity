import { GameRule } from "@serenityjs/protocol";

import { BooleanEnum, IntegerEnum } from "../enums";
import { BoolGameRuleEnum, IntGameRuleEnum } from "../enums/custom/gamerule";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the about command
  world.commandPalette.register(
    "gamerule",
    "Changes a world gamerule value.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create boolean rule overload for the command.
      registry.overload(
        {
          rule: BoolGameRuleEnum,
          value: [BooleanEnum, true]
        },
        (context) => {
          // Get the gamerule from the context
          const gamerule = context.rule.result!;

          // Get the new value from the context
          const value = context.value.result;

          if (value === null) {
            // If no value is defined, print the current rule value.
            const currentValue = world.gamerules[gamerule as GameRule];
            return { message: `§f${gamerule} = ${currentValue}` };
          } else {
            // Set the new rule value.
            world.gamerules[gamerule as GameRule] = value;
          }

          // Return the success message
          return {
            message: `§fGamerule ${gamerule} has been updated to ${value}`
          };
        }
      );

      // Create int rule overload for the command.
      registry.overload(
        {
          rule: IntGameRuleEnum,
          value: [IntegerEnum, true]
        },
        (context) => {
          // Get the gamerule from the context
          const gamerule = context.rule.result!;

          // Get the new value from the context
          const value = context.value.result;

          if (value === null) {
            // If no value is defined, print the current rule value.
            const currentValue = world.gamerules[gamerule as GameRule];
            return { message: `§f${gamerule} = ${currentValue}` };
          } else {
            // Set the new rule value.
            world.gamerules[gamerule as GameRule] = value;
          }

          // Return the success message
          return {
            message: `§fGamerule ${gamerule} has been updated to ${value}`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
