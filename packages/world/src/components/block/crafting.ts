import { BlockIdentifier } from "@serenityjs/block";

import { BlockComponent } from "./block-component";
import { BlockInventoryComponent } from "./inventory";

import type { Block } from "../../block";

class BlockCraftingComponent extends BlockComponent {
	public static readonly identifier = "minecraft:crafting";

	/**
	 * The inventory of the crafting table.
	 */
	public readonly inventory = new BlockInventoryComponent(this.block);

	/**
	 * Bind the crafting component to the crafting table block.
	 */
	public static readonly types = [BlockIdentifier.CraftingTable];

	/**
	 * Create a new crafting component.
	 * @param block The block the component is binded to.
	 */
	public constructor(block: Block) {
		super(block, BlockCraftingComponent.identifier);
	}
}

export { BlockCraftingComponent };
