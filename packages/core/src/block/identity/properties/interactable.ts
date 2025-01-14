import { BlockPermutation } from "../permutation";

import { BlockProperty } from "./property";

// NOTE: This is bound to change, as this is an experimental feature apart of the vanilla scripting api.

class BlockInteractableProperty extends BlockProperty {
  public static readonly component = "minecraft:custom_components";

  /**
   * Create a new interactable property for a permutation.
   */
  public constructor(permutation: BlockPermutation) {
    super(permutation);

    // Create the custom component property.
    this.property.createStringTag({
      name: "dummyComponent",
      value: "ClientDummyCustomComponent"
    });
  }
}

export { BlockInteractableProperty };
