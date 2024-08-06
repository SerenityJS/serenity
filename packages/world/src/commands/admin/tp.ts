import { BlockPositionEnum } from "@serenityjs/command";
import { CommandPermissionLevel, Vector3f } from "@serenityjs/protocol";

import { TargetEnum } from "../enums";
import { Entity } from "../../entity";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"tp",
		"Teleports an entity to a specified location",
		(origin, parameters) => {
			// Get the position to teleport to.
			const { x, y, z, xSteps, ySteps, zSteps } = parameters.position;

			// Get the position to teleport the entity to.
			const {
				x: ex,
				y: ey,
				z: ez
			} = origin instanceof Entity
				? origin.position.floor()
				: new Vector3f(0, 0, 0);

			// Get the new position to teleport the entity to.
			const nx = x === "~" ? ex + xSteps : x === "^" ? ex + 1 : +x;
			const ny = y === "~" ? ey - 1 + ySteps : y === "^" ? ey + 1 : +y;
			const nz = z === "~" ? ez + zSteps : z === "^" ? ez + 1 : +z;

			// Loop through the targets
			for (const target of parameters.target.result) {
				// Teleport the entity to the new location.
				target.teleport(new Vector3f(nx, ny, nz));
			}

			// Send the success message
			return {
				message: `Successfully teleported entity to ${nx}, ${ny}, ${nz}!`
			};
		},
		{
			target: TargetEnum,
			position: BlockPositionEnum
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
