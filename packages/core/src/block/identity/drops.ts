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
   * The probability of the block drop. 0.0 - 1.0
   */
  public readonly probability;

  /**
   * Create a new block drop.
   * @param type The type of the block drop.
   * @param min The minimum amount of the block drop.
   * @param max The maximum amount of the block drop.
   * @param probability The probability of the block drop.
   */
  public constructor(
    type: string,
    min: number,
    max: number,
    probability: number
  ) {
    this.type = type;
    this.min = min;
    this.max = max;
    this.probability = probability;
  }

  /**
   * Roll the block drop and return the amount of the drop.
   * @returns The amount of the drop.
   */
  public roll(): number {
    // Calculate the probability of the drop.
    if (Math.random() > this.probability) return 0;

    // Calculate the amount of the drop.
    return Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
  }
}

export { ItemDrop };
