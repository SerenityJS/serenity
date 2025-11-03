export * from "./identity";
export * from "./creative";
export * from "./palette";
export * from "./traits";
export * from "./stack";
export * from "./types";
export * from "./storage";
export * from "./instance-storage";
export * from "./recipes";

import * as Traits from "./traits";

/**
 * A list of all item stack traits
 */
const ItemStackTraits = Array<typeof Traits.ItemStackTrait>();

// Iterate over each trait
for (const key in Traits) {
  // Get the item trait
  const trait = Traits[key as keyof typeof Traits];

  // Push the item trait to the list
  ItemStackTraits.push(trait);
}

export { ItemStackTraits };
