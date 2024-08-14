import { CommandPermissionLevel, Gamemode } from "@serenityjs/protocol";

import { TargetEnum } from "../enums";
import { Dimension, type World } from "../../world";

import type { Entity } from "../../entity";
import type { Player } from "../../player";

const entityFilter = (entity: Entity) =>
	entity.isAlive &&
	(entity.isPlayer() ? entity.gamemode != Gamemode.Creative : true);

const register = (world: World) => {
	// Register the kill command
	world.commands.register(
		"kill",
		"Kills entities (players, mobs, etc.).",
		(origin, parameters) => {
			// ? Get the valid entities
			const entities = parameters.target.result.filter((entity) =>
				entityFilter(entity)
			);

			if (!parameters.target.result.some((entity) => entityFilter(entity))) {
				if (origin instanceof Dimension) {
					console.info(
						"Players cannot be killed while they are in Creative mode."
					);
				} else
					(origin as Player).sendMessage(
						"Players cannot be killed while they are in Creative mode."
					);
			}

			for (const target of entities) {
				// ? Kill the target is is alive or if the player is not in creative mode
				target.kill();
			}

			// Send the success message
			return {
				message: `Killed ${entities.map((entity) => (entity.isPlayer() ? entity.username : entity.type.identifier)).join(", ")}`
			};
		},
		{
			target: TargetEnum
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
