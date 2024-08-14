import { BlockCoordinates, CommandPermissionLevel } from "@serenityjs/protocol";
import { BlockPositionEnum } from "@serenityjs/command";

import { Dimension, type World } from "../../world";
import { Player } from "../../player";
import { TargetEnum } from "../enums";

import type { Entity } from "../../entity";

const register = (world: World) => {
	// Register the spawnpoint command
	world.commands.register(
		"spawnpoint",
		"Sets the spawn point for a player.",
		(origin, parameters) => {
			// Get the result of the target and position
			const targets = parameters.target.result?.filter((entity: Entity) =>
				entity.isPlayer()
			);

			if (!targets && origin instanceof Dimension)
				return { message: "You must provide a selection of targets" };

			if (origin instanceof Player) {
				// Get the position of the entity
				const { x: ex, y: ey, z: ez } = origin.position.floor();
				let position = new BlockCoordinates(ex, ey, ez);

				// Get the new position of the entity
				if (parameters.position) {
					const { x, y, z, xSteps, ySteps, zSteps } = parameters.position;
					const nx = x === "~" ? ex + xSteps : x === "^" ? ex + 1 : +x;
					const ny = y === "~" ? ey - 1 + ySteps : y === "^" ? ey + 1 : +y;
					const nz = z === "~" ? ez + zSteps : z === "^" ? ez + 1 : +z;

					position = new BlockCoordinates(nx, ny, nz);
				}

				if (targets) {
					for (const target of targets) target.spawnPosition = position;
				} else origin.spawnPosition = position;

				// Send the success message
				return {
					message: `Set spawnpoint for ${targets ? targets.map((player) => player.username).join(", ") : origin.username}.`
				};
			} else {
				if (!parameters.position)
					return {
						message: "You need to provide a position to set the spawn point"
					};
				const { x, y, z } = parameters.position;
				// Get the new position of the entity
				const nx = x === "~" ? 0 : x === "^" ? 0 + 1 : +x;
				const ny = y === "~" ? 0 : y === "^" ? 0 + 1 : +y;
				const nz = z === "~" ? 0 : z === "^" ? 0 + 1 : +z;
				const position = new BlockCoordinates(nx, ny, nz);

				for (const target of targets) target.spawnPosition = position;

				// Send the success message
				return {
					message: `Set spawnpoint for ${targets.map((player) => player.username).join(", ")}.`
				};
			}
		},
		{
			target: [TargetEnum, true],
			position: [BlockPositionEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
