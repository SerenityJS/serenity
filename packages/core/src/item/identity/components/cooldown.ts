import { FloatTag, StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeCooldownComponentOptions {
  /**
   * The category of the cooldown component.
   */
  category: string;

  /**
   * The duration of the cooldown component in seconds.
   */
  duration: number;
}

class ItemTypeCooldownComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:cooldown";

  /**
   * Create a new item type cooldown component.
   * @param type The item type of the component.
   * @param options The options for the component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeCooldownComponentOptions>
  ) {
    super(type);

    // Set the default values.
    this.setCategory(options?.category ?? "cooldown." + type.identifier);
    this.setDuration(options?.duration ?? 0);
  }

  /**
   * Get the category of the cooldown component.
   * @returns The category of the cooldown component.
   */
  public getCategory(): string {
    // Get the category component.
    const category = this.component.get<StringTag>("category");

    // Return the category.
    return category?.valueOf() ?? "cooldown." + this.type.identifier;
  }

  /**
   * Set the category of the cooldown component.
   * @param value The category of the cooldown component.
   */
  public setCategory(value: string): void {
    // Set the category component.
    this.component.add(new StringTag(value, "category"));
  }

  /**
   * Get the duration of the cooldown component in seconds.
   * @param ticks Whether to return the duration in ticks; default is false.
   * @returns The duration of the cooldown component in seconds or ticks.
   */
  public getDuration(ticks = false): number {
    // Get the duration component.
    const duration = this.component.get<FloatTag>("duration");

    // Return the duration.
    const seconds = duration?.valueOf() ?? 0;

    // Return the duration in seconds or ticks.
    return ticks ? seconds * 20 : seconds;
  }

  /**
   * Set the duration of the cooldown component in seconds.
   * @param value The duration of the cooldown component in seconds or ticks.
   * @param ticks Whether the value is in ticks; default is false.
   */
  public setDuration(value: number, ticks = false): void {
    // Check if the duration should be in ticks.
    const duration = ticks ? value / 20 : value;

    // Set the duration component.
    this.component.add(new FloatTag(duration, "duration"));
  }
}

export { ItemTypeCooldownComponent, ItemTypeCooldownComponentOptions };
