export * from "./identity";
export * from "./entity";
export * from "./player";
export * from "./container";
export * from "./traits";
export * from "./maps";
export * from "./palette";
export * from "./system-info";

import * as Traits from "./traits";

/**
 * A list of all entity traits
 */
const EntityTraits = Array<typeof Traits.EntityTrait>();

// Iterate over each trait
for (const key in Traits) {
  // Get the entity trait
  const trait = Traits[key as keyof typeof Traits];

  // Push the entity trait to the list
  EntityTraits.push(trait);
}

export { EntityTraits };
