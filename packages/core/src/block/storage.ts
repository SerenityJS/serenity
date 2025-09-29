import { BinaryStream } from "@serenityjs/binarystream";
import {
  BaseTag,
  CompoundTag,
  IntTag,
  ListTag,
  StringTag
} from "@serenityjs/nbt";
import { BlockPosition } from "@serenityjs/protocol";

import { JSONLikeValue } from "..";
import { Chunk } from "../world";

class BlockLevelStorage extends CompoundTag {
  /**
   * The chunk that this storage belongs to.
   */
  private readonly chunk: Chunk;

  public constructor(chunk: Chunk, source?: CompoundTag | BlockLevelStorage) {
    super(); // No tag name is needed for block storage

    // Assign the chunk to the storage
    this.chunk = chunk;

    // If a source is provided, copy its contents
    if (source) super.push(...source.values());
  }

  /**
   * The the size of the storage, excluding position and metadata tags.
   */
  public get size(): number {
    // Get the size of the storage (number of tags)
    let size = super.size;

    // If the storage contains 'x', 'y', and 'z' tags, exclude them from the size
    if (this.has("x")) size--;
    if (this.has("y")) size--;
    if (this.has("z")) size--;

    // Return the calculated size
    return size;
  }

  public set<T extends BaseTag>(key: string, value: T): this {
    // Set the tag in the storage using the parent class method
    const result = super.set(key, value);

    // Mark the chunk as needing to be saved
    if (this.size > 0) this.chunk.dirty = true;

    // Return the result of the set operation
    return result;
  }

  public add<T extends BaseTag>(tag: T): T {
    // Add the tag to the storage using the parent class method
    const result = super.add(tag);

    // Mark the chunk as needing to be saved
    if (this.size > 0) this.chunk.dirty = true;

    // Return the added tag
    return result;
  }

  public push<T extends BaseTag>(...tags: Array<T>): this {
    // Push the tags to the storage using the parent class method
    const result = super.push(...tags);

    // Mark the chunk as needing to be saved
    if (this.size > 0) this.chunk.dirty = true;

    // Return the result of the push operation
    return result;
  }

  public delete(key: string): boolean {
    // Delete the tag from the storage using the parent class method
    const result = super.delete(key);

    // Mark the chunk as needing to be saved
    if (this.size > 0 && result) this.chunk.dirty = true;

    // Return whether a tag was deleted
    return result;
  }

  public clear(): void {
    // Clear all tags from the storage using the parent class method
    // Except for position tags
    for (const key of this.keys())
      if (key !== "x" && key !== "y" && key !== "z") super.delete(key);
  }

  /**
   * Get the block position from the storage.
   * @returns The BlockPosition representing the block's coordinates.
   */
  public getPosition(): BlockPosition {
    // Get the x, y, and z coordinates from the storage
    const x = super.get<IntTag>("x")?.valueOf() ?? 0;
    const y = super.get<IntTag>("y")?.valueOf() ?? 0;
    const z = super.get<IntTag>("z")?.valueOf() ?? 0;

    // Return a new BlockPosition with the coordinates
    return new BlockPosition(x, y, z);
  }

  /**
   * Set the block position in the storage.
   * @param position The BlockPosition to set in the storage.
   */
  public setPosition(position: BlockPosition): void {
    // Set the x, y, and z coordinates in the storage
    super.set("x", new IntTag(position.x));
    super.set("y", new IntTag(position.y));
    super.set("z", new IntTag(position.z));
  }

  /**
   * Get the dynamic properties of the block from the level storage.
   * @returns An array of tuples containing property identifiers and their values.
   */
  public getDynamicProperties(): Array<[string, JSONLikeValue]> {
    // Prepare an array to hold dynamic properties
    const properties: Array<[string, JSONLikeValue]> = [];

    // Get the dynamic properties list from the storage
    const dynamicProperties = super.get<ListTag<CompoundTag>>(
      "dynamic_properties"
    );

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
   * Set dynamic properties for the block in the level storage.
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
    super.set("dynamic_properties", dynamicProperties);
  }

  public hasDynamicProperty(key: string): boolean {
    // Get the existing dynamic properties list
    const dynamicProperties = super.get<ListTag<CompoundTag>>(
      "dynamic_properties"
    );

    // If the dynamic properties list does not exist, return false
    if (!dynamicProperties) return false;

    // Iterate over each compound tag in the dynamic properties list
    for (const property of dynamicProperties.values()) {
      // Get the property identifier
      const identifier = property.get<StringTag>("identifier");

      // If the identifier exists and matches the key, return true
      if (identifier && identifier.valueOf() === key) {
        return true;
      }
    }

    // If no matching property was found, return false
    return false;
  }

  public getDynamicProperty<T extends JSONLikeValue = JSONLikeValue>(
    key: string
  ): T | null {
    // Get the existing dynamic properties list
    const dynamicProperties = super.get<ListTag<CompoundTag>>(
      "dynamic_properties"
    );

    // If the dynamic properties list does not exist, return undefined
    if (!dynamicProperties) return null;

    // Iterate over each compound tag in the dynamic properties list
    for (const property of dynamicProperties.values()) {
      // Get the property identifier
      const identifier = property.get<StringTag>("identifier");
      const value = property.get<StringTag>("value");

      // If both identifier and value exist, and the identifier matches the key, return the parsed value
      if (identifier && value && identifier.valueOf() === key) {
        return JSON.parse(value.valueOf()) as T;
      }
    }

    // If no matching property was found, return undefined
    return null;
  }

  public addDynamicProperty(key: string, value: JSONLikeValue): void {
    // Get the existing dynamic properties list
    const dynamicProperties = super.get<ListTag<CompoundTag>>(
      "dynamic_properties"
    );

    // If the dynamic properties list does not exist, create a new one
    if (!dynamicProperties) {
      const newList = new ListTag<CompoundTag>([], "dynamic_properties");
      super.set("dynamic_properties", newList);
    }

    // Create a new compound tag for the dynamic property
    const propertyTag = new CompoundTag();
    propertyTag.set("identifier", new StringTag(key, "identifier"));
    propertyTag.set("value", new StringTag(JSON.stringify(value), "value"));

    // Add the new property tag to the dynamic properties list
    super.get<ListTag<CompoundTag>>("dynamic_properties")!.push(propertyTag);

    // Mark the chunk as needing to be saved
    if (this.size > 0) this.chunk.dirty = true;
  }

  public removeDynamicProperty(key: string): void {
    // Get the existing dynamic properties list
    const dynamicProperties = super.get<ListTag<CompoundTag>>(
      "dynamic_properties"
    );

    // If the dynamic properties list does not exist, return early
    if (!dynamicProperties) return;

    // Find the index of the property with the given key
    const index = dynamicProperties.findIndex((property) => {
      const identifier = property.get<StringTag>("identifier");
      return identifier?.valueOf() === key;
    });

    // If the property was found, remove it from the list
    if (index !== -1) {
      dynamicProperties.splice(index, 1);

      // Mark the chunk as needing to be saved
      if (this.size > 0) this.chunk.dirty = true;
    }
  }

  public setDynamicProperty<T extends JSONLikeValue = JSONLikeValue>(
    key: string,
    property: T
  ): void {
    // Remove the existing property if it exists
    this.removeDynamicProperty(key);

    // Add the new property
    this.addDynamicProperty(key, property);
  }

  /**
   * Get the traits of the block from the level storage.
   * @returns An array of trait identifiers.
   */
  public getTraits(): Array<string> {
    // Get the traits list from the storage
    const traits = super.get<ListTag<StringTag>>("traits");

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
   * Set traits for the block in the level storage.
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
    super.set("traits", traitsTag);
  }

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

    // Mark the chunk as needing to be saved
    if (this.size > 0) this.chunk.dirty = true;
  }

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

      // Mark the chunk as needing to be saved
      if (this.size > 0) this.chunk.dirty = true;
    }
  }

  /**
   * Initialize the BlockLevelStorage from a buffer.
   * @param chunk The chunk that this storage belongs to.
   * @param buffer The buffer containing the serialized BlockLevelStorage data.
   * @returns A new BlockLevelStorage instance initialized from the buffer.
   */
  public static fromBuffer(chunk: Chunk, buffer: Buffer): BlockLevelStorage {
    // Create a new BinaryStream from the buffer
    const stream = new BinaryStream(buffer);

    // Read the CompoundTag from the stream
    const tag = CompoundTag.read(stream);

    // Return a new BlockLevelStorage instance with the read tag
    return new this(chunk, tag);
  }

  /**
   * Convert the BlockLevelStorage to a buffer.
   * @param storage The BlockLevelStorage or CompoundTag to convert.
   * @returns A Buffer containing the serialized BlockLevelStorage data.
   */
  public static toBuffer(storage: BlockLevelStorage | CompoundTag): Buffer {
    // Create a new BinaryStream to write the storage
    const stream = new BinaryStream();

    // Write the storage to the stream
    this.write(stream, storage);

    // Return the buffer from the stream
    return stream.getBuffer();
  }
}

export { BlockLevelStorage };
