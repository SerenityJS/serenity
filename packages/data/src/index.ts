import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Path to data directory.
const data = resolve(__dirname, "../data");

interface BlockStates {
	identifier: string;
	values: Array<string | number | boolean>;
}

interface BlockTypes {
	identifier: string;
	loggable: boolean;
	components: Array<string>;
	states: Array<string>;
	tags: Array<string>;
	air: boolean;
	liquid: boolean;
	solid: boolean;
}

interface BlockPermutations {
	identifier: string;
	hash: number;
	state: Record<string, string | number | boolean>;
}

interface ItemTypes {
	identifier: string;
	stackable: boolean;
	maxAmount: number;
	tags: Array<string>;
}

interface EntityTypes {
	identifier: string;
	components: Array<string>;
}

interface BlockDrop {
	identifier: string;
	min: number;
	max: number;
	chance: number;
}

interface BlockDrops {
	identifier: string;
	drops: Array<BlockDrop>;
}

/**
 * Block states for all blocks in the game.
 */
const BLOCK_STATES: Array<BlockStates> = JSON.parse(
	readFileSync(resolve(data, "block_states.json"), "utf8")
);

/**
 * Block types for all blocks in the game.
 */
const BLOCK_TYPES: Array<BlockTypes> = JSON.parse(
	readFileSync(resolve(data, "block_types.json"), "utf8")
);

/**
 * Block permutations for all blocks in the game.
 */
const BLOCK_PERMUTATIONS: Array<BlockPermutations> = JSON.parse(
	readFileSync(resolve(data, "block_permutations.json"), "utf8")
);

/**
 * Block drops for all blocks in the game.
 */
const BLOCK_DROPS: Array<BlockDrops> = JSON.parse(
	readFileSync(resolve(data, "block_drops.json"), "utf8")
);

/**
 * Item types for all items in the game.
 */
const ITEM_TYPES: Array<ItemTypes> = JSON.parse(
	readFileSync(resolve(data, "item_types.json"), "utf8")
);

/**
 * Entity types for all entities in the game.
 */
const ENTITY_TYPES: Array<EntityTypes> = JSON.parse(
	readFileSync(resolve(data, "entity_types.json"), "utf8")
);

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

const CRAFTING_DATA = readFileSync(resolve(data, "crafting_data.bin"));

export {
	BLOCK_STATES,
	BLOCK_TYPES,
	BLOCK_PERMUTATIONS,
	BLOCK_DROPS,
	ITEM_TYPES,
	ENTITY_TYPES,
	CANONICAL_BLOCK_STATES,
	BIOME_DEFINITION_LIST,
	CREATIVE_CONTENT,
	ITEMDATA,
	CRAFTING_DATA
};
