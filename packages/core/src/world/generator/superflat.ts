import { Chunk } from "../chunk";
import { BlockPermutation } from "../../block";
import { BlockIdentifier } from "../../enums";

import { TerrainGenerator } from "./generator";

class SuperflatGenerator extends TerrainGenerator {
  public static readonly identifier = "superflat";

  public bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
  public dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
  public grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock);

  public readonly path = __filename;

  public async apply(cx: number, cz: number): Promise<Chunk> {
    // Create a new chunk and set it as not ready
    const chunk = new Chunk(cx, cz, this.dimension.type);

    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        for (let y = -64; y < -60; y++) {
          const position = { x, y, z };

          if (y === -64) {
            chunk.setPermutation(position, this.bedrock, 0, false);
          } else if (y === -63 || y === -62) {
            chunk.setPermutation(position, this.dirt, 0, false);
          } else {
            chunk.setPermutation(position, this.grass, 0, false);
          }
        }
      }
    }

    // Return the chunk
    return chunk;
  }
}

export { SuperflatGenerator };
