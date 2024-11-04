import { WorldEvent } from "../enums";
import { Chunk, Dimension } from "../world";

import { EventSignal } from "./event-signal";

class ChunkReadySignal extends EventSignal {
  public static readonly identifier = WorldEvent.ChunkReady;

  /**
   * The chunk that is ready to be broadcasted.
   */
  public readonly chunk: Chunk;

  /**
   * The dimension that the chunk is in.
   */
  public readonly dimension: Dimension;

  /**
   * Creates a new chunk ready signal.
   * @param dimension The dimension that the chunk is in.
   * @param chunk The chunk that is ready to be broadcasted.
   */
  public constructor(dimension: Dimension, chunk: Chunk) {
    super(dimension.world);
    this.dimension = dimension;
    this.chunk = chunk;
  }
}

export { ChunkReadySignal };
