import { WorldEvent } from "../enums";

import { BlockUpdateSignal } from "./block-update";

import type { Block } from "../block";
import type { ItemStack } from "../item";

class FurnaceSmeltSignal extends BlockUpdateSignal {
	public static readonly identifier = WorldEvent.FurnaceSmelt;

	/**
	 * The ingredient item of the smelt signal.
	 */
	public readonly ingredient: ItemStack;

	/**
	 * The resultant item of the smelt signal.
	 */
	public readonly resultant: ItemStack;

	/**
	 * Creates a new furnace smelt signal.
	 * @param block The block the signal is emitted from.
	 * @param ingredient The ingredient item.
	 * @param resultant The resultant item.
	 */
	public constructor(
		block: Block,
		ingredient: ItemStack,
		resultant: ItemStack
	) {
		super(block);
		this.ingredient = ingredient;
		this.resultant = resultant;
	}
}

export { FurnaceSmeltSignal };
