import { BlockStateComponent } from "./state";

import type { Vector3f } from "@serenityjs/protocol";
import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockUpsideDownBitComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:upside_down_bit";

	public static readonly state = "upside_down_bit";

	public constructor(block: Block) {
		super(block, BlockUpsideDownBitComponent.identifier);
	}

	public onPlace(_: Player, clickPosition: Vector3f): void {
		// Check if the click position is on the top face of the block
		if (clickPosition.y === 1) return this.setUpsideDown(false);

		// Check if the click position is on the bottom face of
		if (clickPosition.y === 0) return this.setUpsideDown(true);

		// Check if the block needs to be upside down
		const upsideDown = clickPosition.y > 0.5;

		// Set the direction of the block
		return this.setUpsideDown(upsideDown);
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setUpsideDown(upsideDown: boolean): void {
		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			upside_down_bit: upsideDown
		};

		// Set the direction of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation) this.block.setPermutation(permutation);
	}
}

export { BlockUpsideDownBitComponent };
