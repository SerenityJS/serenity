import { BLOCK_TYPES } from "@serenityjs/data";

import { BlockIdentifier, ItemIdentifier } from "../enums";

/**
 * Items that place a block of another name, which their item types do not name as the block they place.
 * Signs place the standing kind, which the sign item trait turns into the kind on a wall,
 * and seeds, carrots and potatoes are planted as their crops.
 */
const ItemPlacedBlocks: Record<string, string> = {
  [ItemIdentifier.OakSign]: BlockIdentifier.StandingSign,
  [ItemIdentifier.DarkOakSign]: BlockIdentifier.DarkoakStandingSign,
  [ItemIdentifier.Redstone]: BlockIdentifier.RedstoneWire,
  [ItemIdentifier.Repeater]: BlockIdentifier.UnpoweredRepeater,
  [ItemIdentifier.Comparator]: BlockIdentifier.UnpoweredComparator,
  [ItemIdentifier.String]: BlockIdentifier.TripWire,
  [ItemIdentifier.WheatSeeds]: BlockIdentifier.Wheat,
  [ItemIdentifier.PumpkinSeeds]: BlockIdentifier.PumpkinStem,
  [ItemIdentifier.MelonSeeds]: BlockIdentifier.MelonStem,
  [ItemIdentifier.BeetrootSeeds]: BlockIdentifier.Beetroot,
  [ItemIdentifier.TorchflowerSeeds]: BlockIdentifier.TorchflowerCrop,
  [ItemIdentifier.PitcherPod]: BlockIdentifier.PitcherCrop,
  [ItemIdentifier.Potato]: BlockIdentifier.Potatoes,
  [ItemIdentifier.Carrot]: BlockIdentifier.Carrots
};

/**
 * Blocks whose item has another name: the blocks of ItemPlacedBlocks,
 * along with their kinds on a wall or powered, and double slabs, which are picked as their slab.
 */
const BlockItems: Record<string, string> = {
  [BlockIdentifier.WallSign]: ItemIdentifier.OakSign,
  [BlockIdentifier.DarkoakWallSign]: ItemIdentifier.DarkOakSign,
  [BlockIdentifier.PoweredRepeater]: ItemIdentifier.Repeater,
  [BlockIdentifier.PoweredComparator]: ItemIdentifier.Comparator
};

// Add the blocks placed by items, as placed by those items
for (const [item, block] of Object.entries(ItemPlacedBlocks))
  BlockItems[block] = item;

// Add the signs of the other kinds of wood, which name their blocks after their items,
// and the double slabs, which are picked as their slab
for (const { identifier } of BLOCK_TYPES) {
  if (
    identifier.endsWith("_standing_sign") &&
    identifier !== BlockIdentifier.DarkoakStandingSign
  ) {
    // Get the item of the sign, which the standing and wall signs are placed by
    const item = identifier.replace("_standing_sign", "_sign");
    ItemPlacedBlocks[item] = identifier;
    BlockItems[identifier] = item;
    BlockItems[identifier.replace("_standing_sign", "_wall_sign")] = item;
  } else if (identifier.includes("double") && identifier.endsWith("_slab")) {
    // Copper slabs put "double" first, and others before "slab"
    BlockItems[identifier] = identifier.replace("double_", "");
  }
}

export { ItemPlacedBlocks, BlockItems };
