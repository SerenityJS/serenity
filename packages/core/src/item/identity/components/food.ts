import {
  ByteTag,
  IntTag,
  FloatTag,
  StringTag,
  CompoundTag
} from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

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
}

export { ItemTypeFoodComponent, ItemTypeFoodComponentOptions };
