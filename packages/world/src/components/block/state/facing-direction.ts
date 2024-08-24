import { CardinalDirection } from "../../../enums";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockFacingDirectionComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:facing_direction";

	public static readonly state = "facing_direction";

	public constructor(block: Block) {
		super(block, BlockFacingDirectionComponent.identifier);
	}

	public onPlace(player: Player): void {
		// Check if the pitch is between -90 and -60
		if (player.rotation.pitch >= -90 && player.rotation.pitch <= -60) {
			// Set the direction of the block to be upside down
			return this.setDirection(0);
		}

		// Check if the pitch is between 90 and 60
		if (player.rotation.pitch >= 60 && player.rotation.pitch <= 90) {
			// Set the direction of the block to be upright
			return this.setDirection(1);
		}

		switch (player.getCardinalDirection()) {
			case CardinalDirection.North: {
				return this.setDirection(2);
			}

			case CardinalDirection.South: {
				return this.setDirection(3);
			}

			case CardinalDirection.West: {
				return this.setDirection(4);
			}

			case CardinalDirection.East: {
				return this.setDirection(5);
			}
		}
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setDirection(direction: number): void {
		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			facing_direction: direction
		};

		// Set the direction of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}
}

export { BlockFacingDirectionComponent };
