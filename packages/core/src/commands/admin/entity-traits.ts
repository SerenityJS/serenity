import { CommandPermissionLevel } from "@serenityjs/protocol";

import {
  EntityTraitEnum,
  JsonObjectEnum,
  TargetEnum,
  TraitActionEnum
} from "../enums";
import { EntityTrait } from "../../entity";
import { JSONLikeObject } from "../../types";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the traits command
  world.commands.register(
    "entity-traits",
    "wip",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      registry.overload(
        {
          entity: TargetEnum,
          action: TraitActionEnum
        },
        (context) => {
          // Get the action from the context
          const action = context.action.result as "list";

          // Check if the action is not list
          if (action !== "list")
            throw new TypeError("Expected trait type after action input.");

          // Get the targets from the context
          const targets = context.entity.result ?? [];

          // Check if the targets are empty
          if (targets.length === 0)
            throw new Error("No targets matched specified selector.");

          // Prepare the message array
          const message: Array<string> = [];

          // Push the message to the message array
          message.push("Listing traits for the following entities:");

          // Iterate over the targets
          for (const entity of targets) {
            // Get the id of the entity
            const id = entity.isPlayer()
              ? entity.username
              : `${entity.identifier} §7(§8${JSON.stringify(entity.position.floor())}§7)§r`;

            // Get the traits of the entity
            const traits = [...entity.traits.keys()];

            // Push the entity and traits to the message
            message.push(`  §7- §u${id}§7: [§f${traits.join("§7, §f")}§7]§r`);
          }

          return {
            message: message.join("\n")
          };
        }
      );

      registry.overload(
        {
          entity: TargetEnum,
          action: TraitActionEnum,
          trait: EntityTraitEnum,
          options: [JsonObjectEnum, true]
        },
        (context) => {
          // Get the action from the context
          const action = context.action.result as "add" | "remove";

          // Check if the action is not add or remove
          if (action !== "add" && action !== "remove")
            throw new TypeError("Unexpected input after trait action.");

          // Get the targets from the context
          const targets = context.entity.result ?? [];

          // Check if the targets are empty
          if (targets.length === 0)
            throw new Error("No targets matched specified selector.");

          // Get the trait from the context
          const traitName = context.trait.result as string;

          // Prepare the message array
          const message: Array<string> = [];

          // Push the message to the message array
          message.push(
            `${action === "add" ? "Adding" : "Removing"} trait ${traitName} for the following entities:`
          );

          // Iterate over the targets
          for (const entity of targets) {
            // Check if the action is add
            if (action === "add") {
              // Get the options from the context
              const options = (context.options.result ?? {}) as JSONLikeObject;

              // Get the trait from the palette
              const trait = entity.world.entityPalette.getTrait(traitName);

              // Check if the trait exists
              if (!trait) continue;

              // Add the trait to the entity
              entity.addTrait(trait as unknown as EntityTrait, options);

              // Get the id of the entity
              const id = entity.isPlayer()
                ? entity.username
                : `${entity.identifier} §7(§8${JSON.stringify(entity.position.floor())}§7)§r`;

              // Push the entity and trait to the message
              message.push(`  §7- §u${id}§7: [§f${traitName}§7]§r`);
            } else {
              // Remove the trait from the entity
              entity.removeTrait(traitName);

              // Get the id of the entity
              const id = entity.isPlayer()
                ? entity.username
                : `${entity.identifier} §7(§8${JSON.stringify(entity.position.floor())}§7)§r`;

              // Push the entity and trait to the message
              message.push(`  §7- §u${id}§7: [§f${traitName}§7]§r`);
            }
          }

          return {
            message: message.join("\n")
          };
        }
      );
    },
    () => {}
  );
};

export default register;
