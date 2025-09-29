import {
  CompoundTag,
  FloatTag,
  ListTag,
  LongTag,
  StringTag
} from "@serenityjs/nbt";
import { Rotation, Vector3f } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";
import { JSONLikeValue } from "../../types";
import { Entity } from "../entity";
import { Chunk } from "../../world";

import { PlayerLevelStorage } from "./player";

class EntityLevelStorage extends CompoundTag {
  /**
   * The storage key for dynamic properties.
   */
  protected static readonly DYNAMIC_PROPERTIES_KEY = "dynamic_properties";

  /**
   * The entity associated with this level storage.
   */
  private readonly entity: Entity;

  /**
   * The dynamic properties map holding property identifiers and their corresponding CompoundTag representations.
   */
  protected readonly dynamicProperties = new Map<string, CompoundTag>();

  /**
   * The chunk where the entity is currently stored (used for position updates).
   */
  private storedChunk: Chunk | null = null;

  public constructor(entity: Entity, source?: CompoundTag) {
    super(); // No tag name needed for entity level storage

    // Assign the entity to the storage
    this.entity = entity;

    // If a source is provided, copy its contents
    if (source) this.push(...source.values());

    // Load dynamic properties from the source if available
    const properties = this.get<ListTag<CompoundTag>>(
      EntityLevelStorage.DYNAMIC_PROPERTIES_KEY
    );

    // Check if properties exist
    if (properties) {
      // Populate the dynamic properties map
      for (const property of properties.values()) {
        // Get the identifier of the property
        const identifier = property.get<StringTag>("identifier");

        // If the identifier exists, add the property to the map
        if (identifier)
          this.dynamicProperties.set(identifier.valueOf(), property);
      }
    }
  }

  public isPlayer(): this is PlayerLevelStorage {
    return this.entity instanceof Entity && this.entity.isPlayer();
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

      // Create a new Vector3f instance
      const vector = new Vector3f(x, y, z);

      // Bind the set method to update the position in storage
      vector.set = this.setPosition.bind(this);

      // Return the Vector3f instance
      return vector;
    } else {
      throw new Error("Entity position not found in level storage.");
    }
  }

  /**
   * Set the position of the entity in the level storage.
   * @param position The position to set as a Vector3f instance.
   */
  public setPosition(position: Vector3f): void {
    // Check if there is a stored chunk
    if (this.storedChunk) {
      // Get the new chunk based on the position
      const cx = Math.floor(position.x) >> 4;
      const cz = Math.floor(position.z) >> 4;

      // Get the chunk from the entity's dimension
      const chunk = this.entity.dimension.getChunk(cx, cz);

      // If the chunk is different from the stored chunk, update it
      if (chunk && chunk !== this.storedChunk) {
        // Remove the entity from the old chunk
        this.storedChunk.setEntityStorage(this.entity.uniqueId, null);

        // Update the stored chunk
        this.storedChunk = chunk;

        // Add the entity to the new chunk
        this.storedChunk.setEntityStorage(this.entity.uniqueId, this);
      }
    } else {
      // If there is no stored chunk, get the chunk based on the position
      const cx = Math.floor(position.x) >> 4;
      const cz = Math.floor(position.z) >> 4;

      // Get the chunk from the entity's dimension
      const chunk = this.entity.dimension.getChunk(cx, cz);

      // If the chunk exists, store it and add the entity to it
      if (chunk) {
        this.storedChunk = chunk;
        this.storedChunk.setEntityStorage(this.entity.uniqueId, this);
      }
    }

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

      // Create a new Rotation instance
      const vector = new Rotation(yaw, pitch, yaw);

      // Bind the set method to update the rotation in storage
      vector.set = this.setRotation.bind(this);

      // Return the Rotation instance
      return vector;
    } else {
      // Create a default rotation if not found
      const defaultRotation = new Rotation(0, 0, 0);

      // Set the default rotation in storage
      this.setRotation(defaultRotation);

      // Return the default rotation
      return this.getRotation();
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
    this.set(EntityLevelStorage.DYNAMIC_PROPERTIES_KEY, propertiesList);
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
    this.set(EntityLevelStorage.DYNAMIC_PROPERTIES_KEY, propertiesList);
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
    }
  }
}

export { EntityLevelStorage };
