import { CommandPermissionLevel, Vector3f } from "@serenityjs/protocol";
import { BlockPositionEnum } from "@serenityjs/command";

import { EntityEnum } from "../enums";
import { Entity } from "../../entity";

import type { EntityIdentifier } from "@serenityjs/entity";
import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"summon",
		"Summons an entity at a specified location",
		(origin, parameters) => {
			// Get the result of the entity and position
			const identifier = parameters.entity.result as EntityIdentifier;
			const { x, y, z, xSteps, ySteps, zSteps } = parameters.position;

			if (origin instanceof Entity) {
				// Get the position of the entity
				const { x: ex, y: ey, z: ez } = origin.position.floor();

				// Get the new position of the entity
				const nx = x === "~" ? ex + xSteps : x === "^" ? ex + 1 : +x;
				const ny = y === "~" ? ey - 1 + ySteps : y === "^" ? ey + 1 : +y;
				const nz = z === "~" ? ez + zSteps : z === "^" ? ez + 1 : +z;

				// Spawn the entity at the specified location
				origin.dimension.spawnEntity(identifier, new Vector3f(nx, ny, nz));

				// Send the success message
				return {
					message: `Successfully summoned entity at ${nx}, ${ny}, ${nz}!`
				};
			} else {
				// Get the new position of the entity
				const nx = x === "~" ? 0 : x === "^" ? 0 + 1 : +x;
				const ny = y === "~" ? 0 : y === "^" ? 0 + 1 : +y;
				const nz = z === "~" ? 0 : z === "^" ? 0 + 1 : +z;

				// Spawn the entity at the specified location
				origin.spawnEntity(identifier, new Vector3f(nx, ny, nz));

				// Send the success message
				return {
					message: `Successfully summoned entity at ${nx}, ${ny}, ${nz}!`
				};
			}
		},
		{
			entity: EntityEnum,
			position: BlockPositionEnum
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
