import { CommandPermissionLevel } from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";

import { TagEnum, TargetEnum } from "../enums";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the tag command
	world.commands.register(
		"tag",
		"Interact with the tags of a specific entity.",
		(_, parameters) => {
			// Get the tag operation from the parameters
			const operation = parameters.operation.result;

			// Get the targets from the parameters
			const targets = parameters.target.result;

			// Prepare the message to send to the origin
			const message = [];

			// Loop through the targets
			for (const entity of targets) {
				// Switch the operation
				switch (operation) {
					case "add": {
						// Get the tag from the parameters
						const tag = parameters.tag.result;

						// Add the tag to the entity
						const added = entity.addTag(tag);

						// Get the nametag of the entity
						const nametag = entity.getNametag();

						// Push the message to the array
						if (added) {
							message.push(
								`§7Added tag §a${tag}§7 to §c${nametag ?? entity.unique}§7`
							);
						} else {
							message.push(
								`§7Tag §a${tag}§7 already exists on §c${nametag ?? entity.unique}§7`
							);
						}
						break;
					}

					case "remove": {
						// Get the tag from the parameters
						const tag = parameters.tag.result;

						// Remove the tag from the entity
						const removed = entity.removeTag(tag);

						// Get the nametag of the entity
						const nametag = entity.getNametag();

						// Push the message to the array
						if (removed) {
							message.push(
								`§7Removed tag §a${tag}§7 from §c${nametag ?? entity.unique}§7`
							);
						} else {
							message.push(
								`§7Tag §a${tag}§7 does not exist on §c${nametag ?? entity.unique}§7`
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
							message.push(`§c${nametag ?? entity.unique}§7 has no tags.`);
						} else {
							message.push(
								`§c${nametag ?? entity.unique}§7 has the following tags: §a${tags.join(
									"§7, §a"
								)}`
							);
						}

						break;
					}
				}
			}

			// Return the message
			return { message: message.join("\n") };
		},
		{
			target: TargetEnum,
			operation: TagEnum,
			tag: [StringEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
