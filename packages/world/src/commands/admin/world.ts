import { CommandPermissionLevel, Vector3f } from "@serenityjs/protocol";
import { BlockPositionEnum, StringEnum } from "@serenityjs/command";

import { TargetEnum, WorldEnum } from "../enums";
import { Worlds, type World } from "../../world";
import { Entity } from "../../entity";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"world",
		"Changes the world of the entity",
		(origin, parameters) => {
			// Get the world to teleport to.
			const world = Worlds.get(parameters.world.result);

			// Check if the world exists
			if (!world)
				throw new Error(`World "${parameters.world.result}" not found!`);

			// Get the dimension to teleport to.
			const dimension = world.getDimension(parameters.dimension.result);

			// Check if the dimension exists
			if (!dimension)
				throw new Error(
					`Dimension "${parameters.dimension.result}" not found!`
				);

			// Get the position to teleport to.
			let position: Vector3f | null = null;
			if (parameters.position) {
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

				// Set the new position
				position = new Vector3f(nx, ny, nz);
			}

			// Loop through the targets
			for (const target of parameters.target.result) {
				// Change the world of the entity.
				target.teleport(position ?? target.position, dimension);
			}

			// Send the success message
			return {
				message: `Successfully changed world of entity to ${world.identifier}!`
			};
		},
		{
			target: TargetEnum,
			world: WorldEnum,
			dimension: StringEnum,
			position: [BlockPositionEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
