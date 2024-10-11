import {
  BLOCK_TYPES,
  BLOCK_PERMUTATIONS,
  BLOCK_DROPS,
  BLOCK_METADATA
} from "@serenityjs/data";

import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";
import { ItemDrop } from "./drops";

import type { BlockIdentifier } from "../../enums";

// Iterate over the block types and register them.
for (const type of BLOCK_TYPES) {
  // Check if the block type is already registered.
  if (BlockType.types.has(type.identifier as BlockIdentifier)) {
    throw new Error(`Block type ${type.identifier} is already registered`);
  }

  // Find the block drops for the block type.
  const drop = BLOCK_DROPS.find((drop) => drop.identifier === type.identifier);

  // Find the metadata for the block type.
  const metadata = BLOCK_METADATA.find(
    (meta) => meta.identifier === type.identifier
  ) ?? { hardness: 0, friction: 0, mapColor: "" };

  // Register the block type.
  const instance = new BlockType(
    type.identifier as BlockIdentifier,
    type.loggable,
    type.air,
    type.liquid,
    type.solid,
    metadata.hardness,
    metadata.friction,
    metadata.mapColor,
    type.components,
    type.tags
  );

  // Check if the block type has drops.
  if (drop) {
    for (const entry of drop?.drops ?? []) {
      // Separate the drop information.
      const { identifier, min, max, chance } = entry;

      // Create a new item drop.
      const itemDrop = new ItemDrop(identifier, min, max, chance);

      // Register the item drop to the block type.
      instance.drops.push(itemDrop);
    }
  }
  // Register the default drop for the block type.
  else instance.drops.push(new ItemDrop(type.identifier, 1, 1, 1));

  // Set the block type in the registry.
  BlockType.types.set(type.identifier as BlockIdentifier, instance);
}

// Iterate over the block permutations and register them.
for (const permutation of BLOCK_PERMUTATIONS) {
  // Get the block type from the registry.
  const type = BlockType.types.get(permutation.identifier as BlockIdentifier);

  // Check if the block type exists.
  if (!type) {
    throw new Error(`Block type ${permutation.identifier} does not exist`);
  }

  // Create a new block permutation.
  const instance = new BlockPermutation(
    permutation.hash,
    permutation.state as never,
    type
  );

  // Register the block permutation.
  type.permutations.push(instance);

  // Register the block permutation in the registry.
  BlockPermutation.permutations.set(permutation.hash, instance);
}
