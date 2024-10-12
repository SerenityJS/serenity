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
   * Creates a new instance of the trait.
   */
  public constructor() {
    return this;
  }

  /**
   * Called when the trait is ticked by the dimension.
   * @param deltaTick The delta tick of the trait.
   */
  public onTick?(deltaTick: number): void;

  /**
   * Clones the trait with the specified arguments.
   * @param arguments The arguments to clone the trait with.
   */
  public clone(..._arguments: Array<unknown>): Trait {
    throw new Error(`${this.identifier}.clone() is not implemented`);
  }
}

export { Trait };
