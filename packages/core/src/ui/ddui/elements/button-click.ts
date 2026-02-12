import { Player } from "../../../entity";
import { LongProperty, ObjectProperty } from "../properties";

class ButtonClickElement extends LongProperty {
  /**
   * Create a new button click element.
   * @param parent The parent property of the button click element, which can be used to establish a hierarchical relationship between properties and allow for proper referencing and access within the object hierarchy when serialized and deserialized.
   */
  public constructor(parent: ObjectProperty | null = null) {
    // Provide a default name and initial value for the button click element
    super("onClick", 0n, parent);
  }

  public triggerListeners(player: Player, data: bigint): void {
    // Call the superclass method to trigger all listeners
    super.triggerListeners(player, data);

    // Update the onClick property with the current trigger count
    this.value = data;
  }
}

export { ButtonClickElement };
