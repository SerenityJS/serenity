import { AbilityIndex, CommandPermissionLevel } from "@serenityjs/protocol";
import { BooleanEnum } from "@serenityjs/command";

import { TargetEnum } from "../enums";
import { AbilityEnum } from "../enums/ability";

import type { World } from "../../world";
import type { Entity } from "../../entity";
import { MCIdentifier } from "../../utils/identifier";

const register = (world: World) => {
  // Register the kill command
  world.commands.register(
    "ability",
    "Sets a player's ability.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          player: TargetEnum,
          ability: AbilityEnum,
          value: [BooleanEnum, true],
        },
        (context) => {
          // Get the targets from the context
          const targets = context.player.result as Array<Entity>;

          // Get ability from the context
          const index = context.ability.result as string;
          const ability = AbilityIndex[index as keyof typeof AbilityIndex];

          // Get the enabled from the context
          const enabled = context.value.result as boolean;

          // Prepare the message to send to the origin
          const logs = [];

          // Loop through the targets
          for (const entity of targets) {
            // Check if the entity is a player
            if (!entity.isPlayer()) continue;

            if (enabled == null && targets.length === 1) {
              // Display ability if there is no value argument.
              logs.push(`§f${index} = ${entity.getAbility(ability)}`);
            } else {
              // Otherwise, update the ability for the entity
              entity.setAbility(ability, enabled);
              // Get the nametag of the entity
              const nametag =
                entity.getNametag() ??
                MCIdentifier.format(entity.type.identifier);
              logs.push(
                enabled
                  ? `§fThe '${index}' ability has been granted to ${nametag}`
                  : `§fThe '${index}' ability has been revoked from ${nametag}`
              );
            }
          }

          // Push result message to the array
          if (enabled != null)
            logs.push(
              `§f${targets.length > 1 ? "Abilities have" : "Ability has"} been updated`
            );

          // Send the message to the origin
          return {
            message: logs.join("\n"),
          };
        }
      );
    },
    () => {}
  );
};

export default register;
