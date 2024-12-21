import { BinaryStream } from "@serenityjs/binarystream";
import {
  CREATIVE_CONTENT,
  ITEM_TYPES,
  ITEMDATA,
  TOOL_TYPES
} from "@serenityjs/data";
import { CreativeItems, ItemData } from "@serenityjs/protocol";

import { ItemToolTier, type ItemIdentifier } from "../../enums";
import { BlockType } from "../../block";

import { ItemType } from "./type";
import { CreativeItem } from "./creative";

import type { CompoundTag } from "@serenityjs/nbt";

// Create a new stream from the item data.
const dataStream = new BinaryStream(ITEMDATA);

// Read the item data from the stream.
const data = ItemData.read(dataStream);

// Iterate over the item data.
for (const item of data) {
  // Get the metadata for the item.
  const meta = ITEM_TYPES.find((type) => type.identifier === item.name);

  // Get the tool type for the item.
  const tool = TOOL_TYPES.find((tool) => tool.types.includes(item.name));
  const index = tool?.types.indexOf(item.name);
  const level = index === undefined ? ItemToolTier.None : index + 1;
  const blockType = BlockType.types.get(item.name) ?? null;

  // Create the item type.
  const type = new ItemType(item.name as ItemIdentifier, item.networkId, {
    stackable: meta?.stackable,
    maxAmount: meta?.maxAmount,
    tool: tool?.network,
    tier: level,
    tags: meta?.tags ?? [],
    block: blockType
  });

  // Add the item type to the map.
  ItemType.types.set(type.identifier, type);
}

// Create a new stream from the creative content.
const creativeStream = new BinaryStream(CREATIVE_CONTENT);

// Read the creative content from the stream.
const creative = CreativeItems.read(creativeStream);

// Iterate over the creative content.
for (const [index, item] of creative.entries()) {
  // Get the item type from the map.
  const type = [...ItemType.types.values()].find(
    (type) => type.network === item.network
  );

  // Check if the item type is valid.
  // If not, then continue to the next item.
  if (!type) continue;

  // Do to some reason, some items have an incorrect metadata value,
  // So we will generate our own.
  const metadata = item.metadata ?? 0;
  // index - creative.findIndex((index_) => index_.network === item.network);

  const nbt = item.extras?.nbt as CompoundTag<unknown>;

  // Create a new item instance descriptor.
  item.metadata = metadata;
  // item.networkBlockId = type.block?.permutations[metadata]?.network ?? 0;

  // Set the item in the registry.
  CreativeItem.items.set(index, new CreativeItem(type, metadata, nbt));
}
