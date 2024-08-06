import { ItemIdentifier, ItemType, type Items } from "@serenityjs/item";

import { ItemStack } from "../../item";

import { ItemComponent } from "./item-component";

/**
 * Represents an item that can be smelted in a furnace.
 */
class ItemSmeltableComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:smeltable";

	/**
	 * The types of items that can be smelted.
	 * TODO: Add the rest of the items.
	 */
	public static readonly types = [
		ItemIdentifier.IronOre,
		ItemIdentifier.RawIron,
		ItemIdentifier.GoldOre,
		ItemIdentifier.RawGold,
		ItemIdentifier.CopperOre,
		ItemIdentifier.RawCopper
	];

	/**
	 * The resultant of the smeltable item.
	 */
	public resultant: ItemType = this.item.type;

	/**
	 * The amount of the resultant.
	 */
	public amount = 1;

	/**
	 * The metadata of the resultant.
	 */
	public metadata = 0;

	/**
	 * The amount of time it takes to cook the item.
	 */
	public cookTime = 200;

	/**
	 * Creates a new item smeltable component.
	 * @param item The item the component is binded to.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemSmeltableComponent.identifier);

		// Assign the default values.
		this.assignDefault();
	}

	/**
	 * Assigns the default values to the component.
	 */
	protected assignDefault(): void {
		// Get the item identifier.
		const identifier = this.item.type.identifier;

		// Switch based on the identifier.
		switch (identifier) {
			// Iron products
			case ItemIdentifier.IronOre:
			case ItemIdentifier.RawIron: {
				this.resultant = ItemType.get(ItemIdentifier.IronIngot) as ItemType;
				break;
			}

			// Gold products
			case ItemIdentifier.GoldOre:
			case ItemIdentifier.RawGold: {
				this.resultant = ItemType.get(ItemIdentifier.GoldIngot) as ItemType;
				break;
			}

			// Copper products
			case ItemIdentifier.CopperOre:
			case ItemIdentifier.RawCopper: {
				this.resultant = ItemType.get(ItemIdentifier.CopperIngot) as ItemType;
				break;
			}
		}
	}

	/**
	 * Smelts the item and returns the resultant.
	 * @returns The resultant item stack.
	 */
	public smelt(): ItemStack {
		// Decrease the item count.
		this.item.decrement();

		// Create a new item stack based on the component properties.
		const itemStack = ItemStack.create(
			this.resultant,
			this.amount,
			this.metadata
		);

		// Return the item stack.
		return itemStack;
	}
}

export { ItemSmeltableComponent };
