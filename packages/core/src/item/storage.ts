import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag, IntTag, ListTag, StringTag } from "@serenityjs/nbt";

import { ItemIdentifier } from "../enums";
import { JSONLikeValue } from "..";

class ItemStackLevelStorage extends CompoundTag {
  public constructor(source?: CompoundTag | ItemStackLevelStorage) {
    super(); // No tag name is needed for item stack storage

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
    // Get the stack size from the storage, defaulting to 1 if not found
    return this.get<IntTag>("Count")?.valueOf() ?? 1;
  }

  public setStackSize(size: number): void {
    // Set the stack size in the storage, ensuring it is a positive integer
    this.set("Count", new IntTag(Math.max(1, size)));
  }

  public getMetadata(): number {
    // Get the metadata from the storage, defaulting to 0 if not found
    return this.get<IntTag>("Damage")?.valueOf() ?? 0;
  }

  public setMetadata(metadata: number): void {
    // Set the metadata in the storage, ensuring it is a non-negative integer
    this.set("Damage", new IntTag(metadata));
  }

  public getStackNbt(): CompoundTag {
    // Get the stack NBT from the storage, defaulting to a new CompoundTag if not found
    return this.get<CompoundTag>("tag") ?? new CompoundTag();
  }

  public setStackNbt(stackNbt: CompoundTag): void {
    // Set the stack NBT in the storage
    this.set("tag", stackNbt);
  }

  /**
   * Get the dynamic properties of the item stack from the level storage.
   * @returns An array of tuples containing property identifiers and their values.
   */
  public getDynamicProperties(): Array<[string, JSONLikeValue]> {
    // Prepare an array to hold dynamic properties
    const properties: Array<[string, JSONLikeValue]> = [];

    // Get the dynamic properties list from the storage
    const dynamicProperties =
      this.get<ListTag<CompoundTag>>("dynamic_properties");

    // If the dynamic properties does not exist, return an empty array
    if (!dynamicProperties) return properties;

    // Iterate over each compound tag in the dynamic properties list
    for (const property of dynamicProperties.values()) {
      // Get the property identifier
      const identifier = property.get<StringTag>("identifier");
      const value = property.get<StringTag>("value");

      // If both identifier and value exist, add them to the properties array
      if (identifier && value) {
        // Push the identifier and parsed value as a tuple to the properties array
        properties.push([identifier.valueOf(), JSON.parse(value.valueOf())]);
      }
    }

    // Return the array of dynamic properties
    return properties;
  }

  /**
   * Set dynamic properties for the item stack in the level storage.
   * @param properties An array of tuples containing property identifiers and their values.
   */
  public setDynamicProperties(
    properties: Array<[string, JSONLikeValue]>
  ): void {
    // Create a new ListTag for dynamic properties
    const dynamicProperties = new ListTag<CompoundTag>(
      [],
      "dynamic_properties"
    );

    // Iterate over each property in the provided array
    for (const [key, value] of properties) {
      // Create a new CompoundTag for each property
      const propertyTag = new CompoundTag();

      // Set the identifier and value in the compound tag
      propertyTag.add(new StringTag(key, "identifier"));
      propertyTag.add(new StringTag(JSON.stringify(value), "value"));

      // Add the compound tag to the dynamic properties list
      dynamicProperties.push(propertyTag);
    }

    // Set the dynamic properties list in the storage
    this.set("dynamic_properties", dynamicProperties);
  }

  /**
   * Get the traits of the item stack from the level storage.
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
   * Set traits for the item stack in the level storage.
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
   * Initialize the ItemStackLevelStorage from a buffer.
   * @param buffer The buffer containing the serialized ItemStackLevelStorage data.
   * @returns A new ItemStackLevelStorage instance initialized from the buffer.
   */
  public static fromBuffer(buffer: Buffer): ItemStackLevelStorage {
    // Create a new BinaryStream from the buffer
    const stream = new BinaryStream(buffer);

    // Read the CompoundTag from the stream
    const tag = CompoundTag.read(stream);

    // Return a new ItemStackLevelStorage instance with the read tag
    return new this(tag);
  }

  /**
   * Convert the ItemStackLevelStorage to a buffer.
   * @param storage The ItemStackLevelStorage or CompoundTag to convert.
   * @returns A Buffer containing the serialized ItemStackLevelStorage data.
   */
  public static toBuffer(storage: ItemStackLevelStorage | CompoundTag): Buffer {
    // Create a new BinaryStream to write the storage
    const stream = new BinaryStream();

    // Write the storage to the stream
    this.write(stream, storage);

    // Return the buffer from the stream
    return stream.getBuffer();
  }
}

export { ItemStackLevelStorage };
