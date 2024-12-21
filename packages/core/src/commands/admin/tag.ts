import { CommandPermissionLevel } from "@serenityjs/protocol";

import { StringEnum, TagEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  // Register the kill command
  world.commands.register(
    "tag",
    "Interact with the tags of a specified entity.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          operation: TagEnum,
          tag: [StringEnum, true]
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

                if (!tag) {
                  message.push("§cSyntax error: expected tag at add  <<");
                  break;
                }

                // Add the tag to the entity
                const added = entity.addTag(tag);

                // Push the message to the array
                if (added) {
                  message.push(
                    `§7Added tag §a${tag}§7 to §c${entity.uniqueId}§7`
                  );
                } else {
                  message.push(
                    `§7Tag §a${tag}§7 already exists on §c${entity.uniqueId}§7`
                  );
                }
                break;
              }

              case "remove": {
                // Get the tag from the parameters
                const tag = context.tag.result as string;

                // Remove the tag from the entity
                const removed = entity.removeTag(tag);

                // Push the message to the array
                if (removed) {
                  message.push(
                    `§7Removed tag §a${tag}§7 from §c${entity.uniqueId}§7`
                  );
                } else {
                  message.push(
                    `§7Tag §a${tag}§7 does not exist on §c${entity.uniqueId}§7`
                  );
                }

                break;
              }

              case "list": {
                // Get the tags of the entity
                const tags = entity.getTags();

                // Push the message to the array
                if (tags.length === 0) {
                  message.push(`§c${entity.uniqueId}§7 has no tags.`);
                } else {
                  message.push(
                    `§c${
                      entity.uniqueId
                    }§7 has the following tags: §a${tags.join("§7, §a")}`
                  );
                }

                break;
              }
            }
          }

          // Send the message to the origin
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
