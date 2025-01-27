import { ITEM_TYPES, ITEM_METADATA, TOOL_TYPES } from "@serenityjs/data";

import { ItemToolTier, type ItemIdentifier } from "../../enums";
import { BlockType } from "../../block";

import { ItemType } from "./type";
import { ItemTypeVanillaProperties } from "./properties";

// Iterate over the item types.
for (const type of ITEM_TYPES) {
  // Get the metadata for the item type.
  const metadata = ITEM_METADATA.find(
    (metadata) => metadata.identifier === type.identifier
  );

  // Check if the metadata exists.
  if (!metadata) continue; // If not, then continue to the next item type.

  // Get the tool type for the item type.
  const tool = TOOL_TYPES.find((tool) => tool.types.includes(type.identifier));
  const index = tool?.types.indexOf(type.identifier);
  const level = index === undefined ? ItemToolTier.None : index + 1;

  // Get the block type for the item type.
  const blockType = BlockType.types.get(type.identifier) ?? null;

  const properties = ItemTypeVanillaProperties.fromBase64(metadata.properties);

  // Create the item type.
  const instance = new ItemType(
    type.identifier as ItemIdentifier,
    metadata.networkId,
    {
      version: metadata.itemVersion,
      isComponentBased: metadata.isComponentBased,
      stackable: type.stackable,
      maxAmount: type.maxAmount,
      tool: tool?.network,
      tier: level,
      tags: type.tags ?? [],
      block: blockType,
      properties
    }
  );

  // Add the item type to the map.
  ItemType.types.set(instance.identifier, instance);
}

// // Iterate over the creative groups.
// for (const group of CREATIVE_GROUPS) {
//   // Get the category and name of the group.
//   const { category, name } = group;

//   // Get the icon item type from the map.
//   const icon = ItemType.get(group.icon as ItemIdentifier);
//   if (!icon) continue; // If not, then continue to the next group.

//   // Create a new creative group.
//   const instance = new CreateContentGroup({ identifier: name, category, icon });

//   // Register the creative group.
//   CreateContentGroup.groups.set(instance.index, instance);
// }

// console.log(CreateContentGroup);

// // Create a new stream from the creative content.
// const creativeStream = new BinaryStream(CREATIVE_CONTENT);

// // Read the creative content from the stream.
// const creative = CreativeItem.read(creativeStream);

// // Iterate over the creative content.
// for (const [index, item] of creative.entries()) {
//   // Get the item type from the map.
//   const type = [...ItemType.types.values()].find(
//     (type) => type.network === item.network
//   );

//   // Check if the item type is valid.
//   // If not, then continue to the next item.
//   if (!type) continue;

//   // Do to some reason, some items have an incorrect metadata value,
//   // So we will generate our own.
//   const metadata = item.metadata ?? 0;
//   // index - creative.findIndex((index_) => index_.network === item.network);

//   const nbt = item.extras?.nbt as CompoundTag<unknown>;

//   // Create a new item instance descriptor.
//   item.metadata = metadata;
//   // item.networkBlockId = type.block?.permutations[metadata]?.network ?? 0;

//   // Set the item in the registry.
//   CreativeItem.items.set(index, new CreativeItem(type, metadata, nbt));
// }
