import { BlockStateComponent } from "./state";

import type { Block } from "../../../block";

class BlockGrowthComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:growth";

	public static readonly state = "growth";

	/**
	 * The current growth stage of the block.
	 */
	public stage = 0;

	public constructor(block: Block) {
		super(block, BlockGrowthComponent.identifier);

		// Get the permutation of the block
		const permutation = block.permutation;

		// Get the state of the block
		const state = permutation.state as { growth: number };

		// Set the stage of the block
		this.stage = state.growth;
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setStage(stage: number): void {
		// Set the stage of the block
		this.stage = stage;

		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			growth: stage
		};

		// Set the direction of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}

	public onTick(): void {
		// Get the current tick of the world
		const currentTick = this.block.dimension.world.currentTick;

		// Check if the current tick is not divisible by 20
		// And if the stage is greater than or equal to 7
		if (currentTick % 20n !== 0n || this.stage >= 7) return;

		// Geneate a random number between 0 and 100
		const random = Math.floor(Math.random() * 100);

		// Check if the random number is less than 5
		if (random < 5) {
			// Increment the stage of the block
			this.setStage(this.stage + 1);
		}
	}

	public onBreak(): boolean {
		// The block is fully grown, drop the item
		if (this.stage === 7) return true;

		// Block is not fully grown, don't drop anything
		return false;
	}
}

export { BlockGrowthComponent };
