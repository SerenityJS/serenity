import { DimensionProperties } from "./dimension";

interface WorldProperties {
  /**
   * The identifier of the world.
   */
  identifier: string;

  /**
   * The generation seed of the world.
   */
  seed: number;

  /**
   * The dimension properties of the world.
   */
  dimensions: Array<Partial<DimensionProperties>>;

  /**
   * The amount of minutes between each save.
   */
  saveInterval: number;
}

export { WorldProperties };
