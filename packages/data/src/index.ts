import BlockStates from "./json/block_states.json";
import BlockTypes from "./json/block_types.json";
import BlockPermutations from "./json/block_permutations.json";
import BlockDrops from "./json/block_drops.json";
import BlockMetadata from "./json/block_metadata.json";
import ItemTypes from "./json/item_types.json";
import ItemMetadata from "./json/item_metadata.json";
import ToolTypes from "./json/tool_types.json";
import EntityTypes from "./json/entity_types.json";
import BiomeTypes from "./json/biome_types.json";
import CreativeGroups from "./json/creative_groups.json";
import CreativeContent from "./json/creative_content.json";
import ShapelessRecipes from "./json/shapeless.json";
import ShapedRecipes from "./json/shaped.json";
import CraftingData from "./bin/crafting_data.json";
import BiomeDefinitions from "./bin/biome_definitions.json";

// JSON data
const BLOCK_STATES = BlockStates;
const BLOCK_TYPES = BlockTypes;
const BLOCK_PERMUTATIONS = BlockPermutations;
const BLOCK_DROPS = BlockDrops;
const BLOCK_METADATA = BlockMetadata;
const ITEM_TYPES = ItemTypes;
const ITEM_METADATA = ItemMetadata;
const TOOL_TYPES = ToolTypes;
const ENTITY_TYPES = EntityTypes;
const BIOME_TYPES = BiomeTypes;
const CREATIVE_GROUPS = CreativeGroups;
const CREATIVE_CONTENT = CreativeContent;
const SHAPELESS_RECIPES = ShapelessRecipes;
const SHAPED_RECIPES = ShapedRecipes;

// Buffer data
const CRAFTING_DATA = Buffer.from(CraftingData.base64, "base64");
const BIOME_DEFINITIONS = Buffer.from(BiomeDefinitions.base64, "base64");

export {
  BLOCK_STATES,
  BLOCK_TYPES,
  BLOCK_PERMUTATIONS,
  BLOCK_DROPS,
  BLOCK_METADATA,
  ITEM_TYPES,
  ITEM_METADATA,
  TOOL_TYPES,
  ENTITY_TYPES,
  BIOME_TYPES,
  CREATIVE_GROUPS,
  CREATIVE_CONTENT,
  SHAPELESS_RECIPES,
  SHAPED_RECIPES,
  CRAFTING_DATA,
  BIOME_DEFINITIONS
};
