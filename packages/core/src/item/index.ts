import * as Traits from "./traits";

export * from "./identity";
export * from "./stack";
export * from "./palette";

/**
 * A list of all item stack traits
 */
const ItemTraits = Array<typeof Traits.ItemTrait>();

// Iterate over each trait
for (const key in Traits) {
  // Get the item trait
  const trait = Traits[key as keyof typeof Traits];

  // Push the item trait to the list
  ItemTraits.push(trait);
}

export { ItemTraits };
