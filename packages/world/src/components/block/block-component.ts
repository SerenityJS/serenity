import { Component } from "../component";

import type { BlockIdentifier, BlockType } from "@serenityjs/block";
import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockComponent extends Component {
	/**
	 * A collective registry of all block components registered to a block type.
	 */
	public static readonly registry = new Map<
		BlockIdentifier,
		Array<typeof BlockComponent>
	>();

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
		this.block.setComponent(this as BlockComponent);
	}

	/**
	 * Registers the block component to the block type.
	 * @param type The block type to register the component to.
	 */
	public static register(type: BlockType): void {
		// Get the components of the block type.
		const components = BlockComponent.registry.get(type.identifier) ?? [];

		// Push the component to the registry.
		components.push(this);

		// Set the components to the block type.
		BlockComponent.registry.set(type.identifier, components);
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
	 * Called when the block is updated in the dimension.
	 * This includes when the block is placed, broken, or interacted with.
	 */
	public onUpdate?(): void;

	/**
	 * Called when the block is placed in the dimension.
	 * @note The `player` parameter is optional as the block can be placed by the server.
	 * @param player The player that placed the block.
	 */
	public onPlace?(player?: Player): void;

	/**
	 * Called when the block is destruction process has started in the dimension.
	 * @param player The player that started to destroy the block.
	 */
	public onStartBreak?(player: Player): void;

	/**
	 * Called when the block is destruction process has stopped in the dimension.
	 * @param player The player that stopped destroying the block.
	 */
	public onStopBreak?(player: Player): void;

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
