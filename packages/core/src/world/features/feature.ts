interface FeatureOnTickDetails {
  /**
   * The current tick of the world.
   */
  currentTick: bigint;

  /**
   * The time between the current tick and the last tick.
   */
  deltaTick: number;
}

class Feature {
  /**
   * The unique identifier for this feature.
   */
  public static readonly identifier: string;

  /**
   * The unique identifier for this feature.
   */
  public readonly identifier = (this.constructor as typeof Feature).identifier;

  /**
   * Called every tick while the feature is active.
   * @param details The details of the tick.
   */
  public onTick?(details: FeatureOnTickDetails): void;

  /**
   * Called when the feature is added to a world or dimension.
   */
  public onAdd?(): void;

  /**
   * Called when the feature is removed from a world or dimension.
   */
  public onRemove?(): void;
}

export { Feature, type FeatureOnTickDetails };
