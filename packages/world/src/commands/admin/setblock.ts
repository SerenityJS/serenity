import { CommandPermissionLevel } from "@serenityjs/protocol";
import { BlockPositionEnum, JsonEnum } from "@serenityjs/command";
import { BlockPermutation, type BlockIdentifier } from "@serenityjs/block";

import { BlockEnum } from "../enums";
import { Entity } from "../../entity";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"setblock",
		"Sets a block at the specified location",
		(origin, parameters) => {
			// Get the result of the block, position, and mode
			const result = parameters.block.result;
			const identifier = result.includes(":") ? result : `minecraft:${result}`;
			const { x, y, z, xSteps, ySteps, zSteps } = parameters.position;

			const state = parameters.state?.result
				? JSON.parse(parameters.state.result)
				: {};

			if (origin instanceof Entity) {
				// Get the position of the entity
				const { x: ex, y: ey, z: ez } = origin.position.floor();

				// Get the new position of the block
				const nx = x === "~" ? ex + xSteps : x === "^" ? ex + 1 : +x;
				const ny = y === "~" ? ey - 1 + ySteps : y === "^" ? ey + 1 : +y;
				const nz = z === "~" ? ez + zSteps : z === "^" ? ez + 1 : +z;

				// Get the block at the specified location
				const block = origin.dimension.getBlock(nx, ny, nz);
				const permutation = BlockPermutation.resolve(
					identifier as BlockIdentifier,
					state as unknown as Record<string, string>
				);

				// Set the block at the specified location
				block.setPermutation(permutation);

				// Send the success message
				return {
					message: `Successfully set block at ${nx}, ${ny}, ${nz} to ${identifier}!`
				};
			} else {
				// Get the new position of the block
				const nx = x === "~" ? 0 : x === "^" ? 0 + 1 : +x;
				const ny = y === "~" ? 0 : y === "^" ? 0 + 1 : +y;
				const nz = z === "~" ? 0 : z === "^" ? 0 + 1 : +z;

				// Get the block at the specified location
				const block = origin.getBlock(nx, ny, nz);
				const permutation = BlockPermutation.resolve(
					identifier as BlockIdentifier,
					state as unknown as Record<string, string>
				);

				// Set the block at the specified location
				block.setPermutation(permutation);

				// Send the success message
				return {
					message: `Successfully set block at ${nx}, ${ny}, ${nz} to ${identifier}!`
				};
			}
		},
		{
			position: BlockPositionEnum,
			block: BlockEnum,
			state: [JsonEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
