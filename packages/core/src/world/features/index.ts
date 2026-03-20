export * from "./feature";
export * from "./world";
export * from "./dimension";

import * as IDimensionFeatures from "./dimension";

/**
 * An array of all dimension features that have been registered
 */
const DimensionFeatures = Array<typeof IDimensionFeatures.DimensionFeature>();

// Loop through all the keys in the IDimensionFeatures object
for (const key in IDimensionFeatures) {
  // Fetch the feature from the IDimensionFeatures object using the key
  const feature = IDimensionFeatures[key as keyof typeof IDimensionFeatures];

  // Check if the feature has an identifier property, if not, skip it
  if (!(feature as typeof IDimensionFeatures.DimensionFeature).identifier)
    continue;

  // Push the feature to the DimensionFeatures array
  DimensionFeatures.push(feature as typeof IDimensionFeatures.DimensionFeature);
}

export { DimensionFeatures };
