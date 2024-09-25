import { CommandPermissionLevel } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import { TagEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  // Register the kill command
  world.commands.register(
    "tag",
    "Manages tags stored in entities.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          operation: TagEnum,
          tag: [StringEnum, true],
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Get the operation from the context
          const operation = context.operation.result as string;

          // Prepare the message to send to the origin
          const message = [];

          // Loop through the targets
          for (const entity of targets) {
            // Switch the operation
            switch (operation) {
              case "add": {
                // Get the tag from the parameters
                const tag = context.tag.result as string;

                // Add the tag to the entity
                const added = entity.addTag(tag);

                // Get the nametag of the entity
                const nametag = entity.getNametag();

                // Push the message to the array
                if (added) {
                  message.push(
                    `§fAdded tag §7${tag}§f to ${nametag ?? entity.unique}`
                  );
                } else {
                  message.push(
                    `§fTag §7${tag}§f already exists on ${nametag ?? entity.unique}`
                  );
                }
                break;
              }

              case "remove": {
                // Get the tag from the parameters
                const tag = context.tag.result as string;

                // Remove the tag from the entity
                const removed = entity.removeTag(tag);

                // Get the nametag of the entity
                const nametag = entity.getNametag();

                // Push the message to the array
                if (removed) {
                  message.push(
                    `§fRemoved tag §7${tag}§f from ${nametag ?? entity.unique}`
                  );
                } else {
                  message.push(
                    `§fTag §7${tag}§f does not exist on ${nametag ?? entity.unique}`
                  );
                }

                break;
              }

              case "list": {
                // Get the tags of the entity
                const tags = entity.getTags();

                // Get the nametag of the entity
                const nametag = entity.getNametag();

                // Push the message to the array
                if (tags.length === 0) {
                  message.push(`§f${nametag ?? entity.unique} has no tags.`);
                } else {
                  message.push(
                    `§f${nametag ?? entity.unique} has the following tags: §a${tags.join(
                      "§7, §a"
                    )}`
                  );
                }

                break;
              }
            }
          }

          // Send the message to the origin
          return {
            message: message.join("\n"),
          };
        }
      );
    },
    () => {}
  );
};

export default register;
