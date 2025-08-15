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

  public async populate(chunk: Chunk): Promise<void> {
    const x = chunk.x << 4;
    const z = chunk.z << 4;

    await this.dimension.placeStructure(
      "test",
      { x, y: -50, z },
      { markAsDirty: false }
    );
  }
}

export { SuperflatGenerator };
