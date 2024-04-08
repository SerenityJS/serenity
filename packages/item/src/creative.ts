import type { ItemType } from "./type";

class CreativeItem {
	/**
	 * A collective map of creative items registered.
	 */
	public static readonly items = new Map<number, CreativeItem>();

	/**
	 * The type of the creative item.
	 */
	public readonly type: ItemType;

	/**
	 * The metadata of the creative item.
	 */
	public readonly metadata: number;

	/**
	 * Create a new creative item.
	 * @param type The type of the creative item.
	 * @param metadata The metadata of the creative item.
	 */
	public constructor(type: ItemType, metadata: number) {
		this.type = type;
		this.metadata = metadata;
	}

	/**
	 * Register a new creative item.
	 * @param type The type of the creative item.
	 * @param metadata The metadata of the creative item.
	 */
	public static register(type: ItemType, metadata: number): void {
		// Set the item in the registry.
		CreativeItem.items.set(
			CreativeItem.items.size + 1,
			new CreativeItem(type, metadata)
		);
	}
}

export { CreativeItem };
