import * as Traits from "./traits";

export * from "./identity";
export * from "./traits";
export * from "./palette";
export * from "./block";

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