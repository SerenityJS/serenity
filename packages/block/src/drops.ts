/**
 * Represents a block drop.
 */
class ItemDrop {
	/**
	 * The type of the block drop.
	 */
	public readonly type: string;

	/**
	 * The minimum amount of the block drop.
	 */
	public readonly min: number;

	/**
	 * The maximum amount of the block drop.
	 */
	public readonly max: number;

	/**
	 * Create a new block drop.
	 * @param type The type of the block drop.
	 * @param min The minimum amount of the block drop.
	 * @param max The maximum amount of the block drop.
	 */
	public constructor(type: string, min: number, max: number) {
		this.type = type;
		this.min = min;
		this.max = max;
	}

	public roll(): number {
		return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
	}
}

export { ItemDrop };
