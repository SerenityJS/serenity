import { Dimension } from "../../dimension";
import { Feature } from "../feature";

class DimensionFeature extends Feature {
  /**
   * The dimension that this feature is attached to.
   */
  protected readonly dimension: Dimension;

  /**
   * Creates a new dimension feature.
   * @param dimension The dimension that this feature is attached to.
   */
  public constructor(dimension: Dimension) {
    super();
    this.dimension = dimension;
  }
}

export { DimensionFeature };
