import { JSONLikeObject } from "./types";

interface TraitOnTickDetails {
  /**
   * The current tick of the world.
   */
  currentTick: bigint;

  /**
   * The time between the current tick and the last tick.
   */
  deltaTick: number;
}

class Trait {
  /**
   * The identifier of the trait.
   */
  public static readonly identifier: string;

  /**
   * The type identifiers that this trait is compatible with by default.
   */
  public static readonly types: Array<string>;

  /**
   * The identifier of the trait.
   */
  public readonly identifier = (this.constructor as typeof Trait).identifier;

  /**
   * The chance of this trait being randomly ticked each tick.
   */
  private readonly randomTickProbability: [number, number] = [1, 4096];

  /**
   * Creates a new instance of the trait.
   * @param options additional options for the trait.
   */
  public constructor(_options?: JSONLikeObject) {
    return this;
  }

  /**
   * Called when the trait is added to an object.
   */
  public onAdd?(): void;

  /**
   * Called when the trait is removed from an object.
   */
  public onRemove?(): void;

  /**
   * Called when the trait is ticked by the dimension.
   * @param details The details about the tick event.
   */
  public onTick?(details: TraitOnTickDetails): void;

  /**
   * Called when the trait is random ticked by the dimension.
   */
  public onRandomTick?(): void;

  /**
   * Clones the trait with the specified arguments.
   * @param arguments The arguments to clone the trait with.
   */
  public clone(..._arguments: Array<unknown>): Trait {
    throw new Error(`${this.identifier}.clone() is not implemented`);
  }

  /**
   * Wether this trait should be randomly ticked this tick.
   * @param factor A factor to multiply the chance by. Default is 1.
   * @returns True if the trait should be randomly ticked, false otherwise.
   */
  public shouldRandomTick(factor = 1): boolean {
    // If the numerator is 0, the trait should never be randomly ticked
    if (this.randomTickProbability[0] === 0) return false;

    // If the numerator is equal to the denominator, the trait should always be randomly ticked
    if (this.randomTickProbability[0] === this.randomTickProbability[1])
      return true;

    // Calculate the chance of the trait being randomly ticked
    const chance =
      (this.randomTickProbability[0] * factor) / this.randomTickProbability[1];

    // Generate a random number between 0 and 1
    const random = Math.random();

    // Return true if the random number is less than the chance
    return random < chance;
  }

  /**
   * Sets the probability of this trait being randomly ticked each tick.
   * @param numerator The numerator of the probability fraction.
   * @param denominator The denominator of the probability fraction.
   */
  public setRandomTickProbability(
    numerator: number,
    denominator: number
  ): void {
    // Check that the numerator and denominator are valid
    if (denominator <= 0) throw new Error("Denominator must be greater than 0");

    if (numerator < 0)
      throw new Error("Numerator must be greater than or equal to 0");

    // Validate that numerator is less than or equal to denominator
    if (numerator > denominator)
      throw new Error("Numerator must be less than or equal to denominator");

    // Set the random tick probability
    this.randomTickProbability[0] = numerator;
    this.randomTickProbability[1] = denominator;
  }
}

export { TraitOnTickDetails, Trait };
