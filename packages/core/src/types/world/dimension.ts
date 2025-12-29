import { DimensionType, Vector3f } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { Chunk } from "../../world";

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
   * Filter the entities by their identifier.
   */
  filterEntityId?: EntityIdentifier;
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

  /**
   * The chunk to query entities from.
   */
  chunk?: Chunk;
}

interface StructurePlaceOptions {
  /**
   * The amount of ticks to animate the structure placement over.
   */
  animationTicks?: number;

  /**
   * The number of blocks to place per animation tick.
   */
  blocksPerAnimationTick?: number;

  /**
   * Whether to mark the chunks as dirty after placing the structure.
   */
  markAsDirty?: boolean;

  /**
   * If the structure should place air blocks.
   */
  placeAirBlocks?: boolean;
}

export { DimensionProperties, EntityQueryOptions, StructurePlaceOptions };
