import { BlockStateComponent } from "./state";

import type { CardinalDirection } from "../../../enums";
import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockWeirdoDirectionComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:weirdo_direction";

	public static readonly state = "weirdo_direction";

	public constructor(block: Block) {
		super(block, BlockWeirdoDirectionComponent.identifier);
	}

	public onPlace(player: Player): void {
		// Get the player's cardinal direction
		const direction = player.getCardinalDirection();

		// Set the direction of the block
		this.setDirection(direction);
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setDirection(direction: CardinalDirection): void {
		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			weirdo_direction: direction
		};

		// Get the permutation of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}
}

export { BlockWeirdoDirectionComponent };
