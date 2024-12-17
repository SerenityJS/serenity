import { DimensionType, Vector3f } from "@serenityjs/protocol";

interface DimensionProperties {
  identifier: string;
  type: DimensionType;
  generator: string;
  viewDistance: number;
  simulationDistance: number;
  spawnPosition: [number, number, number];
}

interface EntityQueryOptions {
  /**
   * Limit the number of entities to query.
   */
  count?: number;

  /**
   * The seed position to query entities from.
   */
  position?: Vector3f;

  /**
   * The maximum distance from the position to query entities from.
   * @Note A position is required to use this option.
   */
  maxDistance?: number;

  /**
   * The minimum distance from the position to query entities from.
   * @Note A position is required to use this option.
   */
  minDistance?: number;
}

export { DimensionProperties, EntityQueryOptions };
