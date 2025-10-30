import {
  ByteTag,
  IntTag,
  FloatTag,
  StringTag,
  CompoundTag,
  ListTag
} from "@serenityjs/nbt";
import { EffectType } from "@serenityjs/protocol";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeFoodEffectOptions {
  /**
   * The name of the effect to apply when the food is consumed.
   */
  name: keyof typeof EffectType;

  /**
   * The chance (0 to 1) of the effect being applied when the food is consumed.
   */
  chance: number;

  /**
   * The duration of the effect in seconds.
   */
  duration: number;

  /**
   * The amplifier level of the effect.
   */
  amplifier: number;
}

interface ItemTypeFoodComponentOptions {
  /**
   * Determines if the item can always be eaten, regardless of hunger.
   */
  can_always_eat: boolean;

  /**
   * The nutrition value of the item.
   * @note This value can be negative, which would result in hunger loss.
   */
  nutrition: number;

  /**
   * The saturation modifier of the item.
   * @note This value must be greater than 0.
   */
  saturation_modifier: number;

  /**
   * The item type that this food component converts to when used.
   */
  using_converts_to: ItemType;

  /**
   * Effects that are applied when the food is consumed.
   */
  effects: Array<ItemTypeFoodEffectOptions>;
}

class ItemTypeFoodComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:food";

  /**
   * The item type that this food component converts to when used.
   */
  protected conversionItemType: ItemType | null = null;

  /**
   * Create a new food component for an item type.
   * @param type The item type that the component will be attached to.
   * @param options The options for the food component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeFoodComponentOptions>
  ) {
    // Initialize the component with the item type
    super(type);

    // Assign any provided options to the component
    if (options?.can_always_eat) this.setCanAlwaysEat(options.can_always_eat);
    if (options?.nutrition) this.setNutrition(options.nutrition);
    if (options?.saturation_modifier)
      this.setSaturationModifier(options.saturation_modifier);
    if (options?.using_converts_to)
      this.setUsingConvertsTo(options.using_converts_to);
    if (options?.effects) this.setEffects(options.effects);
  }

  /**
   * Get whether the item can always be eaten, regardless of hunger.
   * @returns True if the item can always be eaten, false otherwise.
   */
  public getCanAlwaysEat(): boolean {
    // Get the "can_always_eat" tag from the component
    const tag = this.component.get<ByteTag>("can_always_eat");

    // Return the value of the tag, defaulting to false if not found
    return tag ? tag.valueOf() === 1 : false;
  }

  /**
   * Set whether the item can always be eaten, regardless of hunger.
   * @param value True if the item can always be eaten, false otherwise.
   */
  public setCanAlwaysEat(value: boolean): void {
    // Create a new ByteTag for the "can_always_eat" property
    const tag = new ByteTag(value ? 1 : 0, "can_always_eat");

    // Set the "can_always_eat" tag in the item's NBT
    this.component.set("can_always_eat", tag);
  }

  /**
   * Get the nutrition value of the item.
   * @note This value can be negative, which would result in hunger loss.
   * @returns The nutrition value of the item, defaulting to 0 if not found.
   */
  public getNutrition(): number {
    // Get the "nutrition" tag from the component
    const tag = this.component.get<IntTag>("nutrition");

    // Return the value of the tag, defaulting to 1 if not found
    return tag ? tag.valueOf() : 1;
  }

  /**
   * Set the nutrition value of the item.
   * @note This value can be negative, which would result in hunger loss.
   * @param value The nutrition value to set for the item.
   */
  public setNutrition(value: number): void {
    // Create a new IntTag for the "nutrition" property
    const tag = new IntTag(value, "nutrition");

    // Set the "nutrition" tag in the item's NBT
    this.component.set("nutrition", tag);
  }

  /**
   * Get the saturation modifier of the item.
   * @note This value must be greater than 0.
   * @returns The saturation modifier of the item, defaulting to 0 if not found.
   */
  public getSaturationModifier(): number {
    // Get the "saturation_modifier" tag from the component
    const tag = this.component.get<FloatTag>("saturation_modifier");

    // Return the value of the tag, defaulting to 0 if not found
    return tag ? tag.valueOf() : 1;
  }

  /**
   * Set the saturation modifier of the item.
   * @note This value must be greater than 0.
   * @param value The saturation modifier to set for the item.
   */
  public setSaturationModifier(value: number): void {
    // Ensure the value is greater than 0
    if (value <= 0)
      // Thow an error if the value is not greater than 0
      throw new Error("Saturation modifier must be greater than 0.");

    // Create a new FloatTag for the "saturation_modifier" property
    const tag = new FloatTag(value, "saturation_modifier");

    // Set the "saturation_modifier" tag in the item's NBT
    this.component.set("saturation_modifier", tag);
  }

  /**
   * Get the item type that this food component converts to when used.
   * @returns The item type that this food component converts to.
   * @throws Error if the conversion item type is not set.
   */
  public getUsingConvertsTo(): ItemType {
    // Get the "using_converts_to" tag from the component
    const tag = this.component.get<CompoundTag>("using_converts_to");

    // Check if the tag exists and has a "name" property
    if (tag && tag.has("name") && !this.conversionItemType) {
      // Get the item type identifier from the tag
      const identifier = tag.get<StringTag>("name")?.valueOf() as string;

      // Retrieve the item type using the identifier
      const type = ItemType.get(identifier);

      // Check if the item type was not found
      if (!type) {
        // Throw an error if the item type was not found
        throw new Error(`Item type with identifier "${identifier}" not found.`);
      } else {
        // Set the conversion item type if it was found
        this.conversionItemType = type;
      }
    }

    // Check if the conversion item type is set
    if (!this.conversionItemType) {
      // Throw an error if it is not set
      throw new Error(
        "This item type does not have a conversion item type set, please set it using the `setUsingConvertsTo` method."
      );
    }

    // Return the conversion item type
    return this.conversionItemType;
  }

  /**
   * Set the item type that this food component converts to when used.
   * @param type The item type that this food component converts to.
   */
  public setUsingConvertsTo(type: ItemType): void {
    // Set the conversion item type
    this.conversionItemType = type;

    // Create a new compound tag for the conversion item type
    const tag = this.component.add(new CompoundTag("using_converts_to"));
    tag.add(new StringTag(type.identifier, "name"));
  }

  /**
   * Get the effects that are applied when the food is consumed.
   * @returns An array of the effect info.
   */
  public getEffects(): Array<{
    id: number;
    chance: number;
    duration: number;
    amplifier: number;
  }> {
    // Get the effects list tag.
    const tag = this.component.get<ListTag<CompoundTag>>("effects");

    // Create an array to hold the read effects.
    const effects: Array<{
      id: number;
      chance: number;
      duration: number;
      amplifier: number;
    }> = [];

    // Check if the tag exists and has a list of effects
    if (tag) {
      // Iterate over each effect in the list
      for (const effectTag of tag.values()) {
        // Extract the effect properties from the tag
        const id = effectTag.get<IntTag>("id")?.valueOf() as number;
        const chance = effectTag.get<FloatTag>("chance")?.valueOf() as number;
        const duration = effectTag.get<IntTag>("duration")?.valueOf() as number;
        const amplifier = effectTag
          .get<IntTag>("amplifier")
          ?.valueOf() as number;

        // Add the effect to the effects array
        effects.push({
          id,
          chance: chance ?? 1,
          duration: duration ?? 0,
          amplifier: amplifier ?? 0
        });
      }
    }

    // Return the array of effects
    return effects;
  }

  /**
   * Set the effects that are applied when the food is consumed.
   * @param effects An array of the effect info to set.
   */
  public setEffects(effects: Array<ItemTypeFoodEffectOptions>): void {
    // Create a new list tag for the effects
    const tag = new ListTag<CompoundTag>();

    // Iterate over each effect in the provided array
    for (const effect of effects) {
      // Create a new compound tag for the effect
      const effectTag = new CompoundTag();

      // Add the effect properties to the tag
      effectTag.add(new IntTag(EffectType[effect.name], "id"));
      effectTag.add(new FloatTag(effect.chance, "chance"));
      effectTag.add(new IntTag(effect.duration, "duration"));
      effectTag.add(new ByteTag(effect.amplifier, "amplifier"));

      // Add the effect tag to the effect list
      tag.push(effectTag);
    }
  }
}

export {
  ItemTypeFoodComponent,
  ItemTypeFoodComponentOptions,
  ItemTypeFoodEffectOptions
};
