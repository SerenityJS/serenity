import { CompoundTag, IntTag, ListTag, StringTag } from "@serenityjs/nbt";

import { ItemIdentifier } from "../enums";
import { JSONLikeValue } from "../types";

import { ItemStack } from "./stack";

class ItemStackLevelStorage extends CompoundTag {
  /**
   * The storage key for dynamic properties.
   */
  protected static readonly DYNAMIC_PROPERTIES_KEY = "dynamic_properties";

  /**
   * The item stack associated with this level storage.
   */
  private readonly itemStack: ItemStack;

  /**
   * The dynamic properties map holding property identifiers and their corresponding CompoundTag representations.
   */
  protected readonly dynamicProperties = new Map<string, CompoundTag>();

  public constructor(itemStack: ItemStack, source?: CompoundTag) {
    super(); // No tag name is needed for item stack storage

    // Assign the item stack to the private property
    this.itemStack = itemStack;

    // If a source is provided, copy its contents
    if (source) this.push(...source.values());
  }

  public getIdentifier(): string | ItemIdentifier {
    // Get the identifier from the storage.
    const identifier = this.get<StringTag>("Name");

    // If the identifier is not found, return a default identifier
    return identifier ? identifier.valueOf() : ItemIdentifier.Air;
  }

  public setIdentifier(identifier: string | ItemIdentifier): void {
    // Set the identifier in the storage
    this.set("Name", new StringTag(identifier.toString()));
  }

  public getStackSize(): number {
    // Get the stack size from the storage, defaulting to 0 if not found
    return this.get<IntTag>("Count")?.valueOf() ?? 0;
  }

  public setStackSize(size: number): void {
    // Set the stack size in the storage, ensuring it is a positive integer
    this.set("Count", new IntTag(Math.max(0, size)));

    // Refresh the item stack in its container
    this.refreshStackInContainer();
  }

  public getAuxiliaryValue(): number {
    // Get the metadata from the storage, defaulting to 0 if not found
    return this.get<IntTag>("Damage")?.valueOf() ?? 0;
  }

  public setAuxiliaryValue(metadata: number): void {
    // Set the metadata in the storage, ensuring it is a non-negative integer
    this.set("Damage", new IntTag(metadata));

    // Refresh the item stack in its container
    this.refreshStackInContainer();
  }

  public getStackNbt(): CompoundTag {
    // Get the stack NBT from the storage, defaulting to a new CompoundTag if not found
    return this.get<CompoundTag>("tag") ?? new CompoundTag();
  }

  public setStackNbt(stackNbt: CompoundTag): void {
    // Set the stack NBT in the storage
    this.set("tag", stackNbt);

    // Refresh the item stack in its container
    this.refreshStackInContainer();
  }

  /**
   * Get all dynamic properties from the level storage.
   * @returns An array of tuples containing property identifier and its value.
   */
  public getAllDynamicProperties(): Array<[string, JSONLikeValue]> {
    // Create an array to hold all dynamic properties
    const properties: Array<[string, JSONLikeValue]> = [];

    // Iterate over the dynamicProperties map and push each entry to the array
    for (const [identifier, tag] of this.dynamicProperties.entries()) {
      // Get the value from the CompoundTag
      const valueTag = tag.get<StringTag>("value");

      // If the value tag exists, parse its value and add it to the properties array
      if (valueTag) {
        // Attempt to parse the value as JSON
        try {
          // Attempt to parse the value as JSON
          const parsedValue = JSON.parse(valueTag.valueOf());

          // Push the identifier and parsed value as a tuple to the properties array
          properties.push([identifier, parsedValue]);
        } catch {
          // If parsing fails, store the raw string value
          properties.push([identifier, valueTag.valueOf()]);
        }
      }
    }

    // Return the array of dynamic properties
    return properties;
  }

  /**
   * Check if a dynamic property exists in the level storage.
   * @param identifier The identifier of the dynamic property to check.
   * @returns True if the property exists, false otherwise.
   */
  public hasDynamicProperty(identifier: string): boolean {
    return this.dynamicProperties.has(identifier);
  }

  /**
   * Get a dynamic property by its identifier.
   * @param identifier The identifier of the dynamic property to retrieve.
   * @returns The value of the dynamic property, or null if not found.
   */
  public getDynamicProperty<T extends JSONLikeValue>(
    identifier: string
  ): T | null {
    // Get the CompoundTag for the given identifier
    const tag = this.dynamicProperties.get(identifier);

    // If the tag exists, get the value and parse it as JSON
    if (tag) {
      const valueTag = tag.get<StringTag>("value");

      // If the value tag exists, attempt to parse its value as JSON
      if (valueTag) {
        try {
          return JSON.parse(valueTag.valueOf());
        } catch {
          // If parsing fails, return the raw string value
          return valueTag.valueOf() as T;
        }
      }
    }

    // If the tag or value does not exist, return null
    return null;
  }

  /**
   * Set a dynamic property in the level storage.
   * @param identifier The identifier of the dynamic property to set.
   * @param value The value of the dynamic property to set.
   */
  public setDynamicProperty<T extends JSONLikeValue>(
    identifier: string,
    value: T
  ): void {
    // Create a new CompoundTag for the dynamic property
    const propertyTag = new CompoundTag();

    // Set the identifier and value in the compound tag
    propertyTag.add(new StringTag(identifier, "identifier"));
    propertyTag.add(new StringTag(JSON.stringify(value), "value"));

    // Add or update the dynamic property in the map
    this.dynamicProperties.set(identifier, propertyTag);

    // Create a new ListTag to hold the dynamic properties
    const propertiesList = new ListTag<CompoundTag>(
      this.dynamicProperties.values()
    );

    // Update the entity's storage with the new dynamic properties
    this.set(ItemStackLevelStorage.DYNAMIC_PROPERTIES_KEY, propertiesList);
  }

  /**
   * Remove a dynamic property from the level storage.
   * @param identifier The identifier of the dynamic property to remove.
   */
  public removeDynamicProperty(identifier: string): void {
    // Remove the dynamic property from the map
    this.dynamicProperties.delete(identifier);

    // Create a new ListTag to hold the dynamic properties
    const propertiesList = new ListTag<CompoundTag>(
      this.dynamicProperties.values()
    );

    // Update the entity's storage with the new dynamic properties
    this.set(ItemStackLevelStorage.DYNAMIC_PROPERTIES_KEY, propertiesList);
  }
  /**
   * Get the traits of the item from the level storage.
   * @returns An array of trait identifiers.
   */
  public getTraits(): Array<string> {
    // Get the traits list from the storage
    const traits = this.get<ListTag<StringTag>>("traits");

    // If the traits does not exist, return an empty array
    if (!traits) return [];

    // Prepare an array to hold the trait values
    const identifiers: Array<string> = [];

    // Iterate over each StringTag in the traits list
    for (const trait of traits.values()) {
      // If the trait exists, add its value to the identifiers array
      if (trait) {
        identifiers.push(trait.valueOf());
      }
    }

    // Return the array of trait identifiers
    return identifiers;
  }

  /**
   * Set traits for the item in the level storage.
   * @param traits An array of trait identifiers to set.
   */
  public setTraits(traits: Array<string>): void {
    // Create a new ListTag for traits
    const traitsTag = new ListTag<StringTag>([], "traits");

    // Iterate over each trait in the provided array
    for (const trait of traits) {
      // Create a new StringTag for each trait
      const tag = new StringTag(trait);

      // Add the StringTag to the traits list
      traitsTag.push(tag);
    }

    // Set the traits list in the storage
    this.set("traits", traitsTag);
  }

  /**
   * Checks if the item stack has a specific trait.
   * @param identifier The identifier of the trait to check.
   * @returns Whether the item stack has the specified trait.
   */
  public hasTrait(identifier: string): boolean {
    // Get the existing traits list
    const traits = super.get<ListTag<StringTag>>("traits");

    // If the traits list does not exist, return false
    if (!traits) return false;

    // Iterate over each StringTag in the traits list
    for (const trait of traits.values()) {
      // If the trait exists and matches the identifier, return true
      if (trait && trait.valueOf() === identifier) {
        return true;
      }
    }

    // If no matching trait was found, return false
    return false;
  }

  /**
   * Adds a trait to the item stack.
   * @param identifier The identifier of the trait to add.
   * @returns void
   */
  public addTrait(identifier: string): void {
    // Check if the trait already exists
    if (this.hasTrait(identifier)) return;

    // Get the existing traits list
    const traits = super.get<ListTag<StringTag>>("traits");

    // If the traits list does not exist, create a new one
    if (!traits) {
      const newList = new ListTag<StringTag>([], "traits");
      super.set("traits", newList);
    }

    // Add the new trait identifier to the traits list
    super.get<ListTag<StringTag>>("traits")!.push(new StringTag(identifier));
  }

  /**
   * Removes a trait from the item stack.
   * @param identifier The identifier of the trait to remove.
   * @returns void
   */
  public removeTrait(identifier: string): void {
    // Check if the trait exists
    if (!this.hasTrait(identifier)) return;

    // Get the existing traits list
    const traits = super.get<ListTag<StringTag>>("traits");

    // If the traits list does not exist, return early
    if (!traits) return;

    // Find the index of the trait with the given identifier
    const index = traits.findIndex((trait) => trait?.valueOf() === identifier);

    // If the trait was found, remove it from the list
    if (index !== -1) {
      traits.splice(index, 1);
    }
  }

  /**
   * Refreshes the item stack in its container, updating or removing it as necessary.
   * @returns True if the item was refreshed; false otherwise.
   */
  private refreshStackInContainer(): boolean {
    // Check if the item is in a container.
    if (!this.itemStack.container) return false;

    // Get the slot of the item in the container.
    const slot = this.itemStack.getSlot();

    // Check if the item is 0 or less.
    if (this.itemStack.getStackSize() <= 0) {
      // Remove the item from the container.
      this.itemStack.container.clearSlot(slot);

      // Indicate that the item was removed.
      return false;
    } else {
      // Update the item in the container.
      this.itemStack.container.setItem(slot, this.itemStack);

      // Indicate that the item was refreshed.
      return true;
    }
  }
}

export { ItemStackLevelStorage };
