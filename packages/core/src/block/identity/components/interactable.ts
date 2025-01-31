import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./property";

// NOTE: This is bound to change, as this is an experimental feature apart of the vanilla scripting api.

class BlockTypeInteractableComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:custom_components";

  /**
   * Create a new interactable property for a block definition.
   * @param block The block definition that this property will be attached to.
   */
  public constructor(block: BlockType | BlockPermutation) {
    super(block);

    // Create the custom component property.
    this.component.createStringTag({
      name: "dummyComponent",
      value: "ClientDummyCustomComponent"
    });
  }
}

export { BlockTypeInteractableComponent };
