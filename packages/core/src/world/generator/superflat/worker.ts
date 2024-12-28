import { DimensionType } from "@serenityjs/protocol";

import { BlockPermutation } from "../../../block";
import { Chunk } from "../../chunk";
import { TerrainWorker, Worker } from "../worker";
import { BlockIdentifier } from "../../../enums";

import { SuperflatGenerator } from "./generator";

@Worker(SuperflatGenerator)
class SuperflatWorker extends TerrainWorker {
  public static readonly path = __filename;

  public bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock);
  public dirt = BlockPermutation.resolve(BlockIdentifier.Dirt);
  public grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock);

  public apply(cx: number, cz: number, type: DimensionType): Chunk {
    const chunk = new Chunk(cx, cz, type);

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

    // Return the chunk.
    return chunk;
  }
}

export { SuperflatWorker };
