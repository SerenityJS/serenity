import { Component } from "../component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockComponent extends Component {
	/**
	 * The block the component is binded to.
	 */
	protected readonly block: Block;

	/**
	 * Creates a new block component.
	 *
	 * @param block The block the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new block component.
	 */
	public constructor(block: Block, identifier: string) {
		super(identifier);
		this.block = block;

		// Register the component to the block.
		this.block.setComponent(this);
	}

	/**
	 * Clones the block component.
	 * @param block The block to clone the component to.
	 * @returns A new block component.
	 */
	public clone(block: Block): this {
		// Create a new instance of the component.
		const component = new (this.constructor as new (
			block: Block,
			identifier: string
		) => BlockComponent)(block, this.identifier) as this;

		// Copy the key-value pairs.
		for (const [key, value] of Object.entries(this)) {
			// Skip the block.
			if (key === "block") continue;

			// @ts-expect-error
			component[key] = value;
		}

		// Return the component.
		return component;
	}

	/**
	 * Called when the block is placed in the dimension.
	 * @note The `player` parameter is optional as the block can be placed by the server.
	 * @param player The player that placed the block.
	 */
	public onPlace?(player?: Player): void;

	/**
	 * Called when the block is broken in the dimension.
	 * @note The `player` parameter is optional as the block can be broken by the server.
	 * @param player The player that broke the block.
	 */
	public onBreak?(player?: Player): void;

	/**
	 * Called when the block is interacted with in the dimension.
	 * @param player The player that interacted with the block.
	 */
	public onInteract?(player: Player): void;
}

export { BlockComponent };
