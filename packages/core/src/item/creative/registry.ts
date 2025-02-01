import { CREATIVE_GROUPS, CREATIVE_CONTENT } from "@serenityjs/data";
import { BinaryStream } from "@serenityjs/binarystream";
import { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

import { ItemType } from "../identity";
import { ItemIdentifier } from "../../enums";

import { CreateContentGroup } from "./group";

// Iterate over the creative groups.
for (const group of CREATIVE_GROUPS) {
  // Get the category and name of the group.
  const { category, name } = group;

  // Get the icon item type from the map.
  const icon = ItemType.get(group.icon as ItemIdentifier);
  if (!icon) continue; // If not, then continue to the next group.

  // Create a new creative group.
  const instance = new CreateContentGroup({ identifier: name, category, icon });

  // Get the index of the creative group.
  const index = CreateContentGroup.groups.size;

  // Register the creative group.
  CreateContentGroup.groups.set(index, instance);
}

// Iterate over the creative content.
for (const { type, groupIndex, instance } of CREATIVE_CONTENT) {
  // Get the group from the index.
  const group = CreateContentGroup.groups.get(groupIndex);
  if (!group) continue; // If not, then continue to the next content.

  // Get the item type from the map.
  const item = ItemType.get(type as ItemIdentifier);
  if (!item) continue; // If not, then continue to the next content.

  // Assign the creative category and group to the item.
  item.creativeCategory = group.category;
  item.creativeGroup = group.identifier;

  // Create a new stream from the content instance.
  const stream = new BinaryStream(Buffer.from(instance, "base64"));
  const _descriptor = NetworkItemInstanceDescriptor.read(stream); // TODO: <-- broken nbt data, crashes client

  // Register the item to the group.
  group.registerItem(item);
}
