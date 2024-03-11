import type { Block } from "../block";

/**
 * Represents a component of a block.
 */
abstract class BlockComponent {
	/**
	 * The block of the component.
	 */
	public readonly block: Block;

	/**
	 * The type of the component.
	 */
	public abstract readonly type: string;

	/**
	 * Creates a new block component instance.
	 *
	 * @param block The block.
	 */
	public constructor(block: Block) {
		this.block = block;
	}
}

export { BlockComponent };
