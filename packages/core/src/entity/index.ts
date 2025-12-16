export * from "./identity";
export * from "./entity";
export * from "./player";
export * from "./container";
export * from "./traits";
export * from "./palette";
export * from "./storage";
export * from "./types";
export * from "./shared-properties";
export * from "./actor-flags";
export * from "./skin";

import * as Traits from "./traits";

/**
 * A list of all entity traits
 */
const EntityTraits = Array<typeof Traits.EntityTrait>();

// Iterate over each trait
for (const key in Traits) {
  // Get the entity trait
  const trait = Traits[key as keyof typeof Traits];

  if (!(trait as typeof Traits.EntityTrait).identifier) continue;

  // Push the entity trait to the list
  EntityTraits.push(trait as typeof Traits.EntityTrait);
}

export { EntityTraits };
