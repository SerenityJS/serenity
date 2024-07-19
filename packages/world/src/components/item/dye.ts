import { Color } from "@serenityjs/protocol";

import { ItemComponent } from "./item-component";

import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemDyeComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:dye";
	public color: Color;

	public constructor(item: ItemStack<T>) {
		super(item, ItemDyeComponent.identifier);
		this.color = new Color(255, 0, 0, 0);
	}

	public setColor(color: Color): void {
		this.color = color;
	}
}

export { ItemDyeComponent };
