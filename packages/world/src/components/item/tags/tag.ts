import { ItemComponent } from "../item-component";

import type { Items } from "@serenityjs/item";

class ItemTagComponent<T extends keyof Items> extends ItemComponent<T> {
	/**
	 * The tag identifier of the item.
	 */
	public static readonly tag: string;
}

export { ItemTagComponent };
