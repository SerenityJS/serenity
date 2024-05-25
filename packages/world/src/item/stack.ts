import { ItemType, type Items } from "@serenityjs/item";
import {
	CompoundTag,
	ListTag,
	ShortTag,
	StringTag,
	Tag
} from "@serenityjs/nbt";

import type { ItemComponent } from "../components";
import type { ItemComponents } from "../types";
import type {
	NetworkItemInstanceDescriptor,
	NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import type { Container } from "../container";

class ItemStack<T extends keyof Items = keyof Items> {
	/**
	 * The item type of the item stack.
	 */
	public readonly type: ItemType<T>;

	/**
	 * The metadata value of the item stack.
	 */
	public readonly metadata: number;

	/**
	 * The components of the item stack.
	 */
	public readonly components: Map<string, ItemComponent<T>>;

	/**
	 * The container of the item stack.
	 */
	public container: Container | null = null;

	protected _amount: number;

	/**
	 * Creates a new item stack.
	 * @param identifier The identifier of the item.
	 * @param amount The amount of the item.
	 * @param metadata The metadata of the item.
	 */
	public constructor(identifier: T, amount: number, metadata?: number) {
		this.type = ItemType.get(identifier) as ItemType<T>;
		this.metadata = metadata ?? 0;
		this.components = new Map();
		this._amount = amount;
	}

	public get amount(): number {
		return this._amount;
	}

	public set amount(value: number) {
		// Set the amount of the item.
		this._amount = value;

		// Update the item in the container.
		this.update();
	}

	/**
	 * Updates the item stack in the container.
	 */
	public update(): void {
		// Check if the item is in a container.
		if (!this.container) return;

		// Get the slot of the item in the container.
		const slot = this.container.storage.indexOf(this);

		// Set the item in the container.
		this.container.setItem(slot, this);
	}

	/**
	 * Decrements the amount of the item stack.
	 * @param amount The amount to decrement.
	 */
	public decrement(amount?: number): void {
		this.amount -= amount ?? 1;
	}

	/**
	 * Increments the amount of the item stack.
	 * @param amount The amount to increment.
	 */
	public increment(amount?: number): void {
		this.amount += amount ?? 1;
	}

	/**
	 * Gets a component from the item.
	 * @param identifier The identifier of the component.
	 * @returns The component that was found.
	 */
	public getComponent<K extends keyof ItemComponents<T>>(
		identifier: K
	): ItemComponents<T>[K] {
		return this.components.get(identifier) as ItemComponents<T>[K];
	}

	/**
	 * Gets all the components of the item.
	 * @returns All the components of the item.
	 */
	public getComponents(): Array<ItemComponent<T>> {
		return [...this.components.values()];
	}

	/**
	 * Sets a component to the item.
	 * @param component The component to set.
	 */
	public setComponent<K extends keyof ItemComponents<T>>(
		component: ItemComponents<T>[K]
	): ItemComponents<T>[K] {
		this.components.set(component.identifier, component);

		return component;
	}

	/**
	 * Removes a component from the item.
	 * @param identifier The identifier of the component.
	 */
	public removeComponent<K extends keyof ItemComponents<T>>(
		identifier: K
	): void {
		this.components.delete(identifier);
	}

	/**
	 * Converts the item stack to a network item instance descriptor.
	 * Which is used on the protocol level.
	 * @param item The item stack to convert.
	 * @returns The network item instance descriptor.
	 */
	public static toNetworkInstance(
		item: ItemStack
	): NetworkItemInstanceDescriptor {
		// Get the permtuation of the block.
		const permutation = item.type.block?.permutations[item.metadata];

		// Create the NBT tag.
		const nbt = new CompoundTag("", {});

		// Create the display tag.
		const display = new CompoundTag("display", {});

		// Check if the item has a display name.
		if (item.components.has("minecraft:nametag")) {
			// Get the nametag component.
			const nametag = item.getComponent("minecraft:nametag");

			// Create the name tag.
			const name = new StringTag("Name", nametag.currentValue);

			// Set the display name.
			display.addTag(name);
		}

		// Check if the item has lore.
		if (item.components.has("minecraft:lore")) {
			// Get the lore component.
			const lore = item.getComponent("minecraft:lore");

			// Create the lore list tag.
			const loreTag = new ListTag<StringTag>("Lore", [], Tag.String);

			// Iterate over the lore values.
			for (const value of lore.values) {
				// Create the lore tag.
				const loreValue = new StringTag("", value);

				// Push the lore tag.
				loreTag.push(loreValue);
			}

			// Set the lore tag.
			display.addTag(loreTag);
		}

		// Add the display tag.
		if (
			item.components.has("minecraft:nametag") ||
			item.components.has("minecraft:lore")
		)
			nbt.addTag(display);

		// CHeck if the item has enchantments.
		if (item.components.has("minecraft:enchantable")) {
			// Create the enchantable list tag.
			const enchantments = new ListTag<CompoundTag>("ench", [], Tag.Compound);

			// Get the enchantable component.
			const enchantable = item.getComponent("minecraft:enchantable");

			// Iterate over the enchantments.
			for (const [enchantment, level] of enchantable.enchantments) {
				// Create the enchantment tag.
				const enchantmentTag = new CompoundTag("", {});
				enchantmentTag.addTag(new ShortTag("id", enchantment));
				enchantmentTag.addTag(new ShortTag("lvl", level));

				// Push the enchantment tag.
				enchantments.push(enchantmentTag);
			}

			// Set the enchantments tag.
			nbt.addTag(enchantments);
		}

		// Return the item instance descriptor.
		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			networkBlockId: permutation?.network ?? 0,
			extras: {
				nbt,
				canDestroy: [],
				canPlaceOn: []
			}
		};
	}

	/**
	 * Converts a network item instance descriptor to an item stack.
	 * @param descriptor The network item instance descriptor.
	 * @returns The item stack.
	 */
	public static fromNetworkInstance(
		descriptor: NetworkItemInstanceDescriptor
	): ItemStack | null {
		// Get the item type from the network.
		const type = ItemType.getByNetwork(descriptor.network);

		// Check if the item type was found.
		if (!type) return null;

		// Create the item stack.
		const item = new ItemStack(
			type.identifier,
			descriptor.stackSize ?? 1,
			descriptor.metadata ?? 1
		);

		// Return the item stack.
		return item;
	}

	/**
	 * Converts the item stack to a network item stack descriptor.
	 * Which is used on the protocol level.
	 * @param item The item stack to convert.
	 * @returns The network item stack descriptor.
	 */
	public static toNetworkStack(item: ItemStack): NetworkItemStackDescriptor {
		// Get network item instance descriptor.
		const instance = ItemStack.toNetworkInstance(item);

		// Return the item stack descriptor.
		return {
			...instance,
			stackNetId: null // TODO: Implement stackNetId, this is so that the server can track the item stack.
		};
	}

	/**
	 * Creates a new item stack from a provided item type.
	 * @param type The type of the item.
	 * @param amount The amount of the item.
	 * @param metadata The metadata of the item.
	 * @returns The item stack.
	 */
	public static create<T extends keyof Items>(
		type: ItemType<T>,
		amount: number,
		metadata?: number
	): ItemStack<T> {
		return new ItemStack(type.identifier, amount, metadata);
	}
}

export { ItemStack };
