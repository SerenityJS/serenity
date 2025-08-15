import { Chunk } from "../../chunk";
import { TerrainGenerator } from "../generator";

class SuperflatGenerator extends TerrainGenerator {
  public static readonly identifier = "superflat";

  public async apply(cx: number, cz: number): Promise<Chunk> {
    // Create a new chunk via the worker handoff
    const chunk = await this.handoff(cx, cz);

    // Return the chunk
    return chunk;
  }
}

export { SuperflatGenerator };
