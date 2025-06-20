import { FloatTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeUseModifiersComponentOptions {
  /**
   * The movement modifier scale that affects how fast the player can move while using this item.
   */
  movement_modifier: number;

  /**
   * The use duration of the item, which is the time in seconds that the item can be used.
   */
  use_duration: number;
}

class ItemTypeUseModifiersComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:use_modifiers";

  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeUseModifiersComponentOptions>
  ) {
    // Initialize the component with the item type
    super(type);

    // If options are provided, set the properties accordingly
    if (options?.movement_modifier)
      this.setMovementModifier(options.movement_modifier);
    if (options?.use_duration) this.setUseDuration(options.use_duration);
  }

  /**
   * Get the movement modifier scale that affects how fast the player can move while using this item.
   * @returns The movement modifier scale, defaulting to 1 if not set.
   */
  public getMovementModifier(): number {
    // Get the "movement_modifier" tag from the component
    const tag = this.component.get<FloatTag>("movement_modifiers");

    // Return the value of the tag, defaulting to 1 if not found
    return tag ? tag.valueOf() : 1;
  }

  /**
   * Set the movement modifier scale that affects how fast the player can move while using this item.
   * @param value The movement modifier scale to set.
   */
  public setMovementModifier(value: number): void {
    // Create a new FloatTag for the "movement_modifier" property
    const tag = new FloatTag(value, "movement_modifier");

    // Set the "movement_modifier" tag in the item's NBT
    this.component.set("movement_modifier", tag);
  }

  /**
   * Get the use duration of the item, which is the time in seconds that the item can be used.
   * @returns The use duration in seconds, defaulting to 0 if not set.
   */
  public getUseDuration(): number {
    // Get the "use_duration" tag from the component
    const tag = this.component.get<FloatTag>("use_duration");

    // Return the value of the tag, defaulting to 0 if not found
    return tag ? tag.valueOf() : 0;
  }

  /**
   * Set the use duration of the item, which is the time in seconds that the item can be used.
   * @param value The use duration in seconds to set.
   */
  public setUseDuration(value: number): void {
    // Create a new FloatTag for the "use_duration" property
    const tag = new FloatTag(value, "use_duration");

    // Set the "use_duration" tag in the item's NBT
    this.component.set("use_duration", tag);
  }
}

export { ItemTypeUseModifiersComponent, ItemTypeUseModifiersComponentOptions };
