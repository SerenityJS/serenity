import { StringEnum, TagEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  // Register the kill command
  world.commandPalette.register(
    "tag",
    "Interact with the tags of a specified entity.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

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

                // Get the name of the entity
                let name = entity.isPlayer()
                  ? entity.username
                  : entity.getNametag();

                // Check if the name is empty
                if (name.length <= 0) name = entity.identifier;

                // Push the message to the array
                if (added) {
                  // Push the success message to the array
                  message.push(`§7Added tag §u${tag}§7 to §u${name}§7.`);
                } else {
                  // Push the failure message to the array
                  message.push(
                    `§7Tag §u${tag}§7 already exists on §u${name}§7.`
                  );
                }
                break;
              }

              case "remove": {
                // Get the tag from the parameters
                const tag = context.tag.result as string;

                // Remove the tag from the entity
                const removed = entity.removeTag(tag);

                // Get the name of the entity
                let name = entity.isPlayer()
                  ? entity.username
                  : entity.getNametag();

                // Check if the name is empty
                if (name.length <= 0) name = entity.identifier;

                // Push the message to the array
                if (removed) {
                  // Push the success message to the array
                  message.push(`§7Removed tag §u${tag}§7 from §u${name}§7.`);
                } else {
                  // Push the failure message to the array
                  message.push(
                    `§7Tag §u${tag}§7 does not exist on §u${name}§7.`
                  );
                }

                break;
              }

              case "list": {
                // Get the tags of the entity
                const tags = entity.getTags();

                // Get the name of the entity
                let name = entity.isPlayer()
                  ? entity.username
                  : entity.getNametag();

                // Check if the name is empty
                if (name.length <= 0) name = entity.identifier;

                // Push the message to the array
                if (tags.length === 0) {
                  // Push the no tags message to the array
                  message.push(`§u${name}§7 has no tags.`);
                } else {
                  // Push the tags message to the array
                  message.push(
                    `§u${name}§7 has the following tags: §8[§u${tags.join("§8, §u")}§8]§r`
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
