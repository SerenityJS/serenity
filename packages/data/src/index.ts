import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Path to data directory.
const data = resolve(__dirname, "../data");

/**
 * Raw NBT data for the canonical block states.
 */
const CANONICAL_BLOCK_STATES = readFileSync(
	resolve(data, "canonical_block_states.nbt")
);

/**
 * Raw NBT data for the biome definition list.
 */
const BIOME_DEFINITION_LIST = readFileSync(
	resolve(data, "biome_definition_list.nbt")
);

/**
 * Raw binary data for the creative content.
 */
const CREATIVE_CONTENT = readFileSync(resolve(data, "creative_content.bin"));

/**
 * Raw binary data for the item states.
 */
const ITEMDATA = readFileSync(resolve(data, "itemdata.bin"));

export {
	CANONICAL_BLOCK_STATES,
	BIOME_DEFINITION_LIST,
	CREATIVE_CONTENT,
	ITEMDATA
};
