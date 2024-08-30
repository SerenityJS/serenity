import { ItemType, type Items } from "@serenityjs/item";
import {
	ByteTag,
	CompoundTag,
	ListTag,
	ShortTag,
	StringTag,
	Tag
} from "@serenityjs/nbt";

import { ItemComponent, ItemTagComponent } from "../components";

import type {
	NetworkItemInstanceDescriptor,
	NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import type { ItemComponents } from "../types";
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
	public readonly components = new Map<string, ItemComponent<T>>();

	/**
	 * The NBT data of the item stack.
	 */
	public readonly nbt = new CompoundTag("", {});

	/**
	 * If the item stack is stackable.
	 */
	public readonly stackable: boolean;

	/**
	 * The maximum stack size of the item stack.
	 */
	public readonly maxAmount: number;

	/**
	 * The container of the item stack.
	 */
	public container: Container | null = null;

	/**
	 * The amount of the item stack.
	 */
	public amount: number;

	/**
	 * Creates a new item stack.
	 * @param identifier The identifier of the item.
	 * @param amount The amount of the item.
	 * @param metadata The metadata of the item.
	 */
	public constructor(identifier: T, amount: number, metadata?: number) {
		this.type = ItemType.get(identifier) as ItemType<T>;
		this.metadata = metadata ?? 0;
		this.stackable = this.type.stackable;
		this.maxAmount = this.type.maxAmount;
		this.amount = amount;

		// Register the type components to the item.
		for (const component of ItemComponent.registry.get(identifier) ?? [])
			new component(this, component.identifier);

		// Register the tag components to the item.
		for (const tag of this.type.tags) {
			// Get the component from the registry
			const component = [...ItemComponent.components.values()].find((x) => {
				// If the identifier is undefined, we will skip it.
				if (!x.identifier || !(x.prototype instanceof ItemTagComponent))
					return false;

				// Initialize the component as a BlockStateComponent.
				const component = x as typeof ItemTagComponent;

				// Check if the identifier includes the key.
				// As some states dont include a namespace.
				return component.tag === tag;
			});

			// Check if the component exists.
			if (component) new component(this, component.identifier);
		}
	}

	/**
	 * Set the amount of the item stack.
	 * @param amount The amount to set.
	 */
	public setAmount(amount: number): void {
		// Update the amount of the item stack.
		this.amount = amount;

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

		// Check if the item is 0 or less.
		if (this.amount <= 0) {
			// Remove the item from the container.
			this.container.clearSlot(slot);
		}

		// Set the item in the container.
		else this.container.setItem(slot, this);
	}

	/**
	 * Decrements the amount of the item stack.
	 * @param amount The amount to decrement.
	 */
	public decrement(amount?: number): void {
		this.setAmount(this.amount - (amount ?? 1));
	}

	/**
	 * Increments the amount of the item stack.
	 * @param amount The amount to increment.
	 */
	public increment(amount?: number): void {
		this.setAmount(this.amount + (amount ?? 1));
	}

	/**
	 * Checks if the item stack is equal to another item stack.
	 * @param item The item stack to compare.
	 * @returns If the item stack is equal to the other item stack.
	 */
	public equals(item: ItemStack): boolean {
		// Check if the identifiers & metadata are equal.
		if (this.type.identifier !== item.type.identifier) return false;
		if (this.metadata !== item.metadata) return false;
		if (this.components.size !== item.components.size) return false;

		// Iterate over the components and check if they are equal.
		for (const component of this.components.values()) {
			// Check if the item has the component.
			if (!item.components.has(component.identifier)) return false;

			// Get the component from the item.
			const other = item.components.get(
				component.identifier
			) as ItemComponent<T>;

			// Check if the components are equal.
			if (!component.equals(other)) return false;
		}

		// Iterate over the components of the other item.
		for (const component of item.components.values()) {
			// Check if the item has the component.
			if (!this.components.has(component.identifier)) return false;

			// Get the component from the item.
			const other = this.components.get(
				component.identifier
			) as ItemComponent<T>;

			// Check if the components are equal.
			if (!component.equals(other)) return false;
		}

		// Return true if all checks passed.
		return true;
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
	 * Checks if the item has a component.
	 * @param identifier The identifier of the component.
	 * @returns Whether or not the item has the component.
	 */
	public hasComponent<K extends keyof ItemComponents<T>>(
		identifier: K
	): boolean {
		return this.components.has(identifier);
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
	 * Checks if the item is smeltable.
	 * @returns If the item is smeltable.
	 */
	public isSmeltable(): boolean {
		return this.hasComponent("minecraft:smeltable");
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

		// Return the item instance descriptor.
		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			networkBlockId: permutation?.network ?? 0,
			extras: {
				nbt: item.nbt,
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

	/**
	 * Serializes the item stack into a CompoundTag.
	 *
	 * This method converts the item stack's properties and components into a CompoundTag,
	 * which can be used for storage or network transmission.
	 *
	 * @returns The serialized representation of the item stack.
	 */
	public static serialize(itemStack: ItemStack, tagName?: string): CompoundTag {
		// Create the root tag.
		const root = new CompoundTag(tagName).addTag(
			new StringTag("Name", itemStack.type.identifier),
			new ByteTag("Count", itemStack.amount),
			new ShortTag("Damage", itemStack.metadata)
		);

		// Create a components list tag.
		const components = new ListTag<CompoundTag>(
			"SerenityComponents",
			[],
			Tag.Compound
		);

		// Add the components to the root tag.
		root.addTag(components);

		// Iterate over the components and serialize them.
		for (const component of itemStack.getComponents()) {
			// Get the component type.
			const type = ItemComponent.components.get(component.identifier);
			if (!type) continue;

			// Create a data compound tag for the data to be written to.
			// And serialize the component.
			const data = new CompoundTag("data");
			type.serialize(data, component);

			// Create the component tag.
			const componentTag = new CompoundTag().addTag(
				new StringTag("identifier", component.identifier),
				data
			);

			// Add the component to the list.
			components.push(componentTag);
		}

		// Return the root tag.
		return root;
	}

	/**
	 * Deserializes a CompoundTag into an ItemStack.
	 *
	 * This method takes a CompoundTag, extracts the necessary information,
	 * and constructs an ItemStack object from it.
	 *
	 * @param tag The CompoundTag containing the serialized item stack data.
	 * @returns The deserialized Itemstack
	 * @throws Will throw an error if the tag does not contain a valid item identifier.
	 */
	public static deserialize(tag: CompoundTag): ItemStack {
		// Create the item stack.
		const itemIdentifier = tag.getTag<StringTag>("Name");

		// Check if the item identifier is invalid.
		if (!itemIdentifier) throw new Error(`Invalid item tag`);

		// Creat the item stack.
		const item = new ItemStack(
			itemIdentifier.value as keyof Items,
			tag.getTag<ByteTag>("Count")?.value ?? 1,
			tag.getTag<ShortTag>("Damage")?.value ?? 0
		);

		// Deserialize the components.
		const components = tag.getTag<ListTag<CompoundTag>>("SerenityComponents");
		for (const componentTag of components?.value ?? []) {
			// Get the component identifier.
			const identifier = componentTag.getTag<StringTag>("identifier")?.value;
			if (!identifier) continue;

			// Get the component data.
			const data = componentTag.getTag<CompoundTag>("data");
			if (!data) continue;

			// Get the component type.
			const type = ItemComponent.components.get(identifier);
			if (!type) continue;

			// Deserialize the component.
			type.deserialize(data, item);
		}

		// Return the item stack.
		return item;
	}
}

export { ItemStack };
