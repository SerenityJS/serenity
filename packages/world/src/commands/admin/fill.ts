import { CommandPermissionLevel } from "@serenityjs/protocol";
import { BlockPositionEnum, JsonEnum } from "@serenityjs/command";
import { BlockPermutation, type BlockIdentifier } from "@serenityjs/block";

import { BlockEnum } from "../enums";
import { Entity } from "../../entity";

import type { World } from "../../world";

const register = (world: World) => {
	// Register the setblock command
	world.commands.register(
		"fill",
		"Fills a region with a specific block",
		(origin, parameters) => {
			// Get the result of the block, position, and mode
			const identifier = parameters.block.result as BlockIdentifier;

			// Get the start position of the fill
			const {
				x: xS,
				y: yS,
				z: zS,
				xSteps: xStepsS,
				ySteps: yStepsS,
				zSteps: zStepsS
			} = parameters.positionStart;

			// Get the end position of the fill
			const {
				x: xE,
				y: yE,
				z: zE,
				xSteps: xStepsE,
				ySteps: yStepsE,
				zSteps: zStepsE
			} = parameters.positionEnd;

			const state = parameters.state?.result
				? JSON.parse(parameters.state.result)
				: {};

			if (origin instanceof Entity) {
				// Get the position of the entity
				const { x: ex, y: ey, z: ez } = origin.position.floor();

				// Get the new position of the block
				const nxS = xS === "~" ? ex + xStepsS : xS === "^" ? ex + 1 : +xS;
				const nyS = yS === "~" ? ey - 1 + yStepsS : yS === "^" ? ey + 1 : +yS;
				const nzS = zS === "~" ? ez + zStepsS : zS === "^" ? ez + 1 : +zS;

				// Get the new position of the block
				const nxE = xE === "~" ? ex + xStepsE : xE === "^" ? ex + 1 : +xE;
				const nyE = yE === "~" ? ey - 1 + yStepsE : yE === "^" ? ey + 1 : +yE;
				const nzE = zE === "~" ? ez + zStepsE : zE === "^" ? ez + 1 : +zE;

				// Get the amount of blocks to fill
				const amount = (nxE - nxS + 1) * (nyE - nyS + 1) * (nzE - nzS + 1);

				// Get the permutation to fill the region with
				const permutation = BlockPermutation.resolve(
					identifier as BlockIdentifier,
					state as unknown as Record<string, string>
				);

				// Fill the region with the specified block
				for (let x = nxS; x <= nxE; x++) {
					for (let y = nyS; y <= nyE; y++) {
						for (let z = nzS; z <= nzE; z++) {
							const block = origin.dimension.getBlock(x, y, z);
							block.setPermutation(permutation);
						}
					}
				}

				// Send the success message
				return {
					message: `Successfully filled ${amount} blocks with ${identifier}!`
				};
			} else {
				// Get the new position of the block
				const nxS = xS === "~" ? 0 : xS === "^" ? 0 + 1 : +xS;
				const nyS = yS === "~" ? 0 : yS === "^" ? 0 + 1 : +yS;
				const nzS = zS === "~" ? 0 : zS === "^" ? 0 + 1 : +zS;

				// Get the new position of the block
				const nxE = xE === "~" ? 0 : xE === "^" ? 0 + 1 : +xE;
				const nyE = yE === "~" ? 0 : yE === "^" ? 0 + 1 : +yE;
				const nzE = zE === "~" ? 0 : zE === "^" ? 0 + 1 : +zE;

				// Get the amount of blocks to fill
				const amount = (nxE - nxS + 1) * (nyE - nyS + 1) * (nzE - nzS + 1);

				// Get the permutation to fill the region with
				const permutation = BlockPermutation.resolve(
					identifier as BlockIdentifier,
					state as unknown as Record<string, string>
				);

				// Fill the region with the specified block
				for (let x = nxS; x <= nxE; x++) {
					for (let y = nyS; y <= nyE; y++) {
						for (let z = nzS; z <= nzE; z++) {
							const block = origin.getBlock(x, y, z);
							block.setPermutation(permutation);
						}
					}
				}

				// Send the success message
				return {
					message: `Successfully filled ${amount} blocks with ${identifier}!`
				};
			}
		},
		{
			positionStart: BlockPositionEnum,
			positionEnd: BlockPositionEnum,
			block: BlockEnum,
			state: [JsonEnum, true]
		},
		{
			permission: CommandPermissionLevel.Operator
		}
	);
};

export default register;
