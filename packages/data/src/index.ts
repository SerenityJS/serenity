import BlockStates from "./json/block_states.json";
import BlockTypes from "./json/block_types.json";
import BlockPermutations from "./json/block_permutations.json";
import BlockDrops from "./json/block_drops.json";
import BlockMetadata from "./json/block_metadata.json";
import ItemTypes from "./json/item_types.json";
import ToolTypes from "./json/tool_types.json";
import EntityTypes from "./json/entity_types.json";
import CreativeContent from "./bin/creative_content.json";
import CraftingData from "./bin/crafting_data.json";
import ItemData from "./bin/item_data.json";

// JSON data
const BLOCK_STATES = BlockStates;
const BLOCK_TYPES = BlockTypes;
const BLOCK_PERMUTATIONS = BlockPermutations;
const BLOCK_DROPS = BlockDrops;
const BLOCK_METADATA = BlockMetadata;
const ITEM_TYPES = ItemTypes;
const TOOL_TYPES = ToolTypes;
const ENTITY_TYPES = EntityTypes;

// Buffer data
const CREATIVE_CONTENT = Buffer.from(CreativeContent.base64, "base64");
const CRAFTING_DATA = Buffer.from(CraftingData.base64, "base64");
const ITEM_DATA = Buffer.from(ItemData.base64, "base64");

export {
  BLOCK_STATES,
  BLOCK_TYPES,
  BLOCK_PERMUTATIONS,
  BLOCK_DROPS,
  BLOCK_METADATA,
  ITEM_TYPES,
  TOOL_TYPES,
  ENTITY_TYPES,
  CREATIVE_CONTENT,
  CRAFTING_DATA,
  ITEM_DATA
};
