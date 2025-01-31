import { ITEM_TYPES, ITEM_METADATA, TOOL_TYPES } from "@serenityjs/data";
import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { ItemToolTier, type ItemIdentifier } from "../../enums";
import { BlockType } from "../../block";

import { ItemType } from "./type";

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

  const stream = new BinaryStream(Buffer.from(metadata.properties, "base64"));
  const properties = CompoundTag.read(stream);

  // Create the item type.
  const instance = new ItemType(
    type.identifier as ItemIdentifier,
    metadata.networkId,
    {
      properties,
      blockType,
      isComponentBased: metadata.isComponentBased,
      version: metadata.itemVersion,
      stackable: type.stackable,
      maxAmount: type.maxAmount,
      tool: tool?.network,
      tier: level,
      tags: type.tags ?? []
    }
  );

  // Add the item type to the map.
  ItemType.types.set(instance.identifier, instance);
}
