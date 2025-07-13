import {
  ByteTag,
  CompoundTag,
  FloatTag,
  IntTag,
  ListTag,
  LongTag,
  StringTag
} from "@serenityjs/nbt";
import {
  ActorFlag,
  Attribute,
  DataItem,
  Rotation,
  Vector3f
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { EntityIdentifier } from "../../enums";
import { JSONLikeValue } from "../../types";

class EntityLevelStorage extends CompoundTag {
  public constructor(source?: CompoundTag | EntityLevelStorage) {
    super(); // No tag name needed for entity level storage

    // If a source is provided, copy its contents
    if (source) this.push(...source.values());
  }

  /**
   * Get the entity identifier from the level storage.
   * @returns The entity identifier as a string or EntityIdentifier.
   * @throws Error if the identifier is not found.
   */
  public getIdentifier(): string | EntityIdentifier {
    // Check if the identifier tag exists
    const identifier = this.get<StringTag>("identifier");

    // If it exists, return its value
    if (identifier) return identifier.valueOf();
    else throw new Error("Entity identifier not found in level storage.");
  }

  /**
   * Set the entity identifier in the level storage.
   * @param identifier The entity identifier to set, can be a string or EntityIdentifier.
   */
  public setIdentifier(identifier: string | EntityIdentifier): void {
    // Create a new StringTag for the identifier
    const tag = new StringTag(identifier, "identifier");

    // Set the identifier tag in the storage
    this.set("identifier", tag);
  }

  /**
   * Get the unique ID of the entity from the level storage.
   * @returns The unique ID as a bigint.
   * @throws Error if the UniqueID tag is not found.
   */
  public getUniqueId(): bigint {
    // Check if the UniqueId tag exists
    const uniqueId = this.get<LongTag>("UniqueID");

    // If it exists, return its value as a bigint
    if (uniqueId) return BigInt(uniqueId.valueOf());
    else throw new Error("Entity UniqueID not found in level storage.");
  }

  /**
   * Set the unique ID of the entity in the level storage.
   * @param uniqueId The unique ID to set as a bigint.
   */
  public setUniqueId(uniqueId: bigint): void {
    // Create a new LongTag for the UniqueId
    const tag = new LongTag(uniqueId, "UniqueID");

    // Set the UniqueId tag in the storage
    this.set("UniqueID", tag);
  }

  /**
   * Get the position of the entity from the level storage.
   * @returns The position as a Vector3f instance.
   * @throws Error if the position tag is not found.
   */
  public getPosition(): Vector3f {
    // Check if the position tag exists
    const position = this.get<ListTag<FloatTag>>("Pos");

    // If it exists, return its value as a Vector3f
    if (position) {
      // Get the values from the ListTag
      const elements = [...position.values()] as [FloatTag, FloatTag, FloatTag];

      // Get the x, y, and z coordinates from the elements
      const x = elements[0].valueOf();
      const y = elements[1].valueOf();
      const z = elements[2].valueOf();

      // Return a new Vector3f instance
      return new Vector3f(x, y, z);
    } else {
      throw new Error("Entity position not found in level storage.");
    }
  }

  /**
   * Set the position of the entity in the level storage.
   * @param position The position to set as a Vector3f instance.
   */
  public setPosition(position: Vector3f): void {
    // Create a new ListTag for the position
    const posTag = new ListTag<FloatTag>(
      [
        new FloatTag(position.x),
        new FloatTag(position.y),
        new FloatTag(position.z)
      ],
      "Pos"
    );

    // Set the Pos tag in the storage
    this.set("Pos", posTag);
  }

  /**
   * Get the rotation of the entity from the level storage.
   * @returns The rotation as a Rotation instance.
   * @throws Error if the rotation tag is not found.
   */
  public getRotation(): Rotation {
    // Check if the Rotation tag exists
    const rotation = this.get<ListTag<FloatTag>>("Rotation");

    // If it exists, return its value as a Rotation
    if (rotation) {
      // Get the values from the ListTag
      const elements = [...rotation.values()] as [FloatTag, FloatTag];

      // Get yaw and pitch from the elements
      const yaw = elements[0].valueOf();
      const pitch = elements[1].valueOf();

      // Return a new Rotation instance
      return new Rotation(yaw, pitch, yaw);
    } else {
      throw new Error("Entity rotation not found in level storage.");
    }
  }

  /**
   * Set the rotation of the entity in the level storage.
   * @param rotation The rotation to set as a Rotation instance.
   */
  public setRotation(rotation: Rotation): void {
    // Create a new ListTag for the rotation
    const rotTag = new ListTag<FloatTag>(
      [new FloatTag(rotation.yaw), new FloatTag(rotation.pitch)],
      "Rotation"
    );

    // Set the Rotation tag in the storage
    this.set("Rotation", rotTag);
  }

  /**
   * Get the dynamic properties of the entity from the level storage.
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
   * Set dynamic properties for the entity in the level storage.
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
   * Get the traits of the entity from the level storage.
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
   * Set traits for the entity in the level storage.
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
   * Get the metadata of the entity from the level storage.
   * @returns An array of DataItem instances representing the metadata.
   */
  public getMetadata(): Array<DataItem> {
    // Get the metadata list from the storage
    const metadata = this.get<StringTag>("metadata");

    // If the metadata does not exist, return an empty array
    if (!metadata) return [];

    // Create a BinaryStream from the metadata value
    const buffer = Buffer.from(metadata.valueOf(), "base64");
    const stream = new BinaryStream(buffer);

    // Read the metadata entries from the stream
    return DataItem.read(stream);
  }

  /**
   * Set metadata for the entity in the level storage.
   * @param metadata An array of DataItem instances to set as metadata.
   */
  public setMetadata(metadata: Array<DataItem>): void {
    // Create a new BinaryStream to write the metadata
    const stream = new BinaryStream();

    // Write the items to the stream
    DataItem.write(stream, metadata);

    // Convert the stream to a base64 string
    const base64Metadata = stream.getBuffer().toString("base64");

    // Set the metadata in the storage as a StringTag
    this.set("metadata", new StringTag(base64Metadata, "metadata"));
  }

  /**
   * Get the flags of the entity from the level storage.
   * @returns An array of tuples containing ActorFlag and its boolean value.
   */
  public getFlags(): Array<[ActorFlag, boolean]> {
    // Get the flags list from the storage
    const flags = this.get<ListTag<CompoundTag>>("flags");

    // If the flags does not exist, return an empty array
    if (!flags) return [];

    // Prepare an array to hold the flag tuples
    const flagTuples: Array<[ActorFlag, boolean]> = [];

    // Iterate over each compound tag in the flags list
    for (const flag of flags.values()) {
      // Get the flag identifier and value
      const id = flag.get<IntTag>("flag");
      const value = flag.get<ByteTag>("value");

      // If both id and value exist, add them as a tuple to the array
      if (id && value) {
        flagTuples.push([id.valueOf() as ActorFlag, value.valueOf() === 1]);
      }
    }

    // Return the array of flag tuples
    return flagTuples;
  }

  /**
   * Set flags for the entity in the level storage.
   * @param flags An array of tuples containing ActorFlag and its boolean value.
   */
  public setFlags(flags: Array<[ActorFlag, boolean]>): void {
    // Create a new ListTag for flags
    const flagsTag = new ListTag<CompoundTag>([], "flags");

    // Iterate over each flag tuple in the provided array
    for (const [flag, value] of flags) {
      // Create a new CompoundTag for each flag
      const flagTag = new CompoundTag();

      // Set the flag identifier and value in the compound tag
      flagTag.set("flag", new IntTag(flag, "flag"));
      flagTag.set("value", new ByteTag(value ? 1 : 0, "value"));

      // Add the compound tag to the flags list
      flagsTag.push(flagTag);
    }

    // Set the flags list in the storage
    this.set("flags", flagsTag);
  }

  /**
   * Get the flags of the entity from the level storage.
   * @returns An array of tuples containing ActorFlag and its boolean value.
   */
  public getAttributes(): Array<Attribute> {
    // Get the attributes list from the storage
    const attributes = this.get<StringTag>("attributes");

    // If the attributes does not exist, return an empty array
    if (!attributes) return [];

    // Create a BinaryStream from the attributes value
    const buffer = Buffer.from(attributes.valueOf(), "base64");
    const stream = new BinaryStream(buffer);

    // Read the attributes from the stream
    return Attribute.read(stream);
  }

  /**
   * Set attributes for the entity in the level storage.
   * @param attributes An array of Attribute instances to set.
   */
  public setAttributes(attributes: Array<Attribute>): void {
    // Create a new BinaryStream to write the attributes
    const stream = new BinaryStream();

    // Write the attributes to the stream
    Attribute.write(stream, attributes);

    // Convert the stream to a base64 string
    const base64Attributes = stream.getBuffer().toString("base64");

    // Set the attributes in the storage as a StringTag
    this.set("attributes", new StringTag(base64Attributes, "attributes"));
  }

  /**
   * Initialize the EntityLevelStorage from a buffer.
   * @param buffer The buffer containing the serialized EntityLevelStorage data.
   * @returns A new EntityLevelStorage instance initialized from the buffer.
   */
  public static fromBuffer(buffer: Buffer): EntityLevelStorage {
    // Create a new BinaryStream from the buffer
    const stream = new BinaryStream(buffer);

    // Read the CompoundTag from the stream
    const tag = CompoundTag.read(stream);

    // Return a new EntityLevelStorage instance with the read tag
    return new this(tag);
  }

  /**
   * Convert the EntityLevelStorage to a buffer.
   * @param storage The EntityLevelStorage or CompoundTag to convert.
   * @returns A Buffer containing the serialized EntityLevelStorage data.
   */
  public static toBuffer(storage: EntityLevelStorage | CompoundTag): Buffer {
    // Create a new BinaryStream to write the storage
    const stream = new BinaryStream();

    // Write the storage to the stream
    this.write(stream, storage);

    // Return the buffer from the stream
    return stream.getBuffer();
  }
}

export { EntityLevelStorage };
