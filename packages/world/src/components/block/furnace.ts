import { BlockIdentifier } from "@serenityjs/block";

import { BlockComponent } from "./block-component";
import { BlockInventoryComponent } from "./inventory";

import type { Block } from "../../block";

class BlockFurnaceComponent extends BlockComponent {
	public static readonly identifier = "minecraft:furnace";

	public static readonly types = [BlockIdentifier.Furnace];

	public constructor(block: Block) {
		super(block, BlockFurnaceComponent.identifier);
	}

	public onTick(): void {
		// Check if the furnace has a inventory component
		if (!this.block.hasComponent(BlockInventoryComponent.identifier))
			throw new Error("Furnace block does not have a inventory component");

		// Get the inventory component
		const inventory = this.block.getComponent(
			BlockInventoryComponent.identifier
		);

		// // Check if the furnace has a fuel item
		const ingredient = inventory.container.getItem(0);
		const fuel = inventory.container.getItem(1);

		if (ingredient)
			console.log(
				"Ingredient:",
				`${ingredient.type.identifier} x${ingredient.amount}`
			);
		if (fuel) console.log("Fuel:", `${fuel.type.identifier} x${fuel.amount}`);
	}
}

export { BlockFurnaceComponent };
