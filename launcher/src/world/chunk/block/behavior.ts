import type { Block } from "./block";

/**
 * Represents a block behavior.
 */
class BlockBehavior {
	/**
	 * Hardness of the block.
	 */
	public hardness = 0.8;

	/**
	 * Fires when the block is constructed.
	 * This method should be used to initialize the block, and its components.
	 */
	public onConstructed: ((block: Block) => void) | null = null;

	public onFallOn: ((block: Block) => void) | null = null;

	public onInteract: ((block: Block) => void) | null = null;

	public onPlaced: ((block: Block) => void) | null = null;

	public onDestroyed: ((block: Block) => void) | null = null;

	public onStepOn: ((block: Block) => void) | null = null;

	public onStepOff: ((block: Block) => void) | null = null;
}

export { BlockBehavior };
