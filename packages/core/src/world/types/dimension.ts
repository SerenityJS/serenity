import { DimensionType, Vector3f } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { Chunk } from "..";

interface DimensionProperties {
  /**
   * The identifier of the dimension.
   */
  identifier: string;

  /**
   * The type of the dimension.
   */
  type: DimensionType;

  /**
   * The generator used for the dimension.
   */
  generator: string;

  /**
   * The view distance of the dimension.
   */
  viewDistance: number;

  /**
   * The simulation distance of the dimension.
   */
  simulationDistance: number;

  /**
   * The spawn position of the dimension.
   */
  spawnPosition: [number, number, number];

  /**
   * The pregeneration options for the dimension.
   */
  chunkPregeneration?: Array<DimensionPregenerationOption>;
}

interface DimensionPregenerationOption {
  /**
   * The start coordinates of the pregeneration area.
   */
  start: [number, number];

  /**
   * The end coordinates of the pregeneration area.
   */
  end: [number, number];

  /**
   * Whether to lock the chunk data in memory after pregeneration.
   */
  memoryLock?: boolean;
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
