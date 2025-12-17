export * from "./types";
export * from "./identity";
export * from "./traits";
export * from "./palette";
export * from "./block";
export * from "./container";
export * from "./storage";

import * as Traits from "./traits";

/**
 * A list of all block traits
 */
const BlockTraits = Array<typeof Traits.BlockTrait>();

// Iterate over each trait
for (const key in Traits) {
  // Get the block trait
  const trait = Traits[key as keyof typeof Traits];

  // Push the block trait to the list
  BlockTraits.push(trait);
}

export { BlockTraits };
