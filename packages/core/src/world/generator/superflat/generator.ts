import { TerrainGenerator } from "../generator";
import { Chunk } from "../../chunk";

class SuperflatGenerator extends TerrainGenerator {
  public static readonly identifier = "superflat";

  public apply(cx: number, cz: number): Chunk {
    // Create a new chunk and set it as not ready
    const chunk = new Chunk(cx, cz, this.dimension.type);
    chunk.ready = false;

    // Hand the chunk to the worker
    this.handoff(chunk);

    // Return the chunk
    return chunk;
  }
}

export { SuperflatGenerator };
