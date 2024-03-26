import { ContainerId } from "@serenityjs/protocol";

import { ItemStack } from "../item";

/**
 * Represents a container.
 */
abstract class Container {
	/**
	 * The identifier of the container.
	 */
	public readonly identifier: ContainerId;

	/**
	 * The size of the container.
	 */
	public readonly size: number;

	/**
	 * The storage of the container.
	 */
	public readonly storage: Array<ItemStack | null>;

	/**
	 * The amount of empty slots in the container.
	 */
	public emptySlotsCount: number;

	/**
	 * Creates a new container.
	 * @param identifier The identifier of the container.
	 * @param size The size of the container.
	 */
	public constructor(identifier: ContainerId, size: number) {
		this.identifier = identifier;
		this.size = size;
		this.storage = Array.from({ length: size }, () => null);
		this.emptySlotsCount = size;
	}

	/**
	 * Calculates the amount of empty slots in the container.
	 */
	protected calculateEmptySlotCount(): void {
		this.emptySlotsCount = this.storage.filter((item) => item === null).length;
	}

	/**
	 * Gets an item from the container.
	 * @param slot The slot to get the item from.
	 * @returns The item in the slot.
	 */
	public abstract getItem(slot: number): ItemStack | null;

	/**
	 * Sets an item in the container.
	 * @param slot The slot to set the item in.
	 * @param item The item to set.
	 */
	public abstract setItem(slot: number, item: ItemStack): void;

	/**
	 * Adds an item to the container.
	 * @param item The item to add.
	 * @returns The added item.
	 */
	public abstract addItem(item: ItemStack): void;

	/**
	 * Removes an item from the container.
	 * @param slot The slot to remove the item from.
	 * @param amount The amount of the item to remove.
	 */
	public abstract removeItem(slot: number, amount: number): void;

	/**
	 * Swaps items in the container.
	 * @param slot The slot to swap the item from.
	 * @param otherSlot The slot to swap the item to.
	 * @param otherCatainer The other container to swap the item to.
	 */
	public abstract swapItems(
		slot: number,
		otherSlot: number,
		otherCatainer?: Container
	): void;

	/**
	 * Clears a slot in the container.
	 * @param slot The slot to clear.
	 */
	public abstract clearSlot(slot: number): void;
}

export { Container };
