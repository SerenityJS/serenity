import { ItemComponent } from "./item-component";

import type { ItemStack } from "../../item";
import type { Items } from "@serenityjs/item";

class ItemFluidContainerComponent<
	T extends keyof Items
> extends ItemComponent<T> {
	public static identifier: string = "minecraft:fluid_container";
	public fluid?: string;
	public fluidAmount: number;

	public constructor(item: ItemStack<T>) {
		super(item, ItemFluidContainerComponent.identifier);
		this.fluidAmount = 0;
	}

	/**
	 * Set's the liquid content of the item
	 * @param liquidIdentifier The desired fluid to be placed/filled if the liquid is valid
	 */
	public setLiquid(liquidIdentifier: string): this {
		this.fluid = liquidIdentifier;
		return this;
	}

	/**
	 * Sets the liquid content amount  of the item
	 * @param liquidAmount 6 = 1 Bucket, 2 = 1 bottle
	 */
	public setLiquidAmount(liquidAmount: number): this {
		this.fluidAmount = liquidAmount;
		return this;
	}
}

export { ItemFluidContainerComponent };
