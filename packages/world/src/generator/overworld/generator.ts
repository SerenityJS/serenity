import { TerrainGenerator } from "../generator";
import { Chunk } from "../../chunk";

import type { DimensionType } from "@serenityjs/protocol";

class Overworld extends TerrainGenerator {
	public static readonly identifier = "overworld";

	public apply(cx: number, cz: number, type: DimensionType): Chunk {
		// Create a new chunk and set it as not ready
		const chunk = new Chunk(cx, cz, type);
		chunk.ready = false;

		// Hand the chunk to the worker
		this.handoff(chunk);

		// Return the chunk
		return chunk;
	}
}

export { Overworld };
