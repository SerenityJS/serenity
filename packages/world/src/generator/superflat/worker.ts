import { DimensionType } from "@serenityjs/protocol";
import { BlockIdentifier, BlockPermutation } from "@serenityjs/block";

import { Chunk } from "../../chunk";
import { TerrainWorker, Worker } from "../worker";

import { Superflat } from "./generator";

@Worker(Superflat)
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
						chunk.setPermutation(position, this.bedrock, false);
					} else if (y === -63 || y === -62) {
						chunk.setPermutation(position, this.dirt, false);
					} else {
						chunk.setPermutation(position, this.grass, false);
					}
				}
			}
		}

		// Return the chunk.
		return chunk;
	}
}

export { SuperflatWorker };
