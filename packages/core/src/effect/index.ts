import * as Effects from "./effects";

import type { Effect } from "./effects";
export * from "./pallete";
export * from "./effects";

const EntityEffects: Array<typeof Effect> = [];

// Iterate over each effect
for (const key in Effects) {
  // Get the block effect
  const effect = Effects[key as keyof typeof Effects];

  // Push the block effect to the list
  EntityEffects.push(effect);
}

export { EntityEffects };
