import {
  EntityPropertyType,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";
import {
  ByteTag,
  CompoundTag,
  FloatTag,
  IntTag,
  StringTag
} from "@serenityjs/nbt";

import { Entity } from "./entity";
import {
  EntityEnumProperty,
  EntityFloatProperty,
  EntityIntProperty,
  EntityProperty
} from "./identity";

type SharedPropertyValue = string | number | boolean;

class EntitySharedProperties {
  /**
   * The NBT key used to store the properties in the entity's storage.
   */
  private static readonly PROPERTIES_KEY = "properties";

  /**
   * The entity that this property map is attached to.
   */
  private readonly entity: Entity;

  /**
   * Create a new entity property map
   * @param entity The entity that this property map is attached to
   */
  public constructor(entity: Entity) {
    // Assign the entity to the property map
    this.entity = entity;

    // Check if the entity has any properties in its storage
    if (!this.entity.hasStorageEntry(EntitySharedProperties.PROPERTIES_KEY)) {
      // If not, initialize an empty properties storage
      this.entity.setStorageEntry(
        EntitySharedProperties.PROPERTIES_KEY,
        new CompoundTag()
      );
    }

    // Create independent copies of properties from the entity type
    for (const [key, value] of entity.type.getAllProperties()) {
      // Check if the property already exists in the entity's storage
      if (this.hasSharedProperty(key)) continue;

      // Set the property in the entity's storage with its current value
      this.setSharedProperty(key, value.currentValue as SharedPropertyValue);
    }

    // Ensure all properties in the entity's storage exist in the entity type
    for (const [key] of this.getAllSharedProperties()) {
      // Check if the property exists in the entity type
      if (entity.type.hasProperty(key)) continue;

      // Remove the property from the entity's storage if it doesn't exist in the entity type
      this.entity
        .getStorageEntry<CompoundTag>(EntitySharedProperties.PROPERTIES_KEY)!
        .delete(key);

      // Log a warning to the console
      this.entity.world.logger.warn(
        `Property §u${key}§r does not exist on entity type §u${entity.type.identifier}§r, removing it from the entity instance.`
      );
    }
  }

  /**
   * Get all the shared properties of the entity that are shared with the client.
   * @returns An array of tuples containing the identifier and value of each property.
   */
  public getAllSharedProperties(): Array<[string, SharedPropertyValue]> {
    // Prepare the result array
    const result: Array<[string, SharedPropertyValue]> = [];

    // Get the properties storage from the entity
    const storage = this.entity.getStorageEntry<CompoundTag>(
      EntitySharedProperties.PROPERTIES_KEY
    );

    // If there is no properties storage, return an empty array
    if (!storage) return result;

    // Iterate over the properties map
    for (const [identifier, property] of storage.entries()) {
      // Cast the property to the appropriate tag type
      const tag = property as StringTag | FloatTag | IntTag | ByteTag;

      // Switch based on the tag type and push the value to the result array
      switch (tag.constructor) {
        case StringTag:
          result.push([identifier, tag.valueOf()]);
          break;
        case FloatTag:
          result.push([identifier, tag.valueOf()]);
          break;
        case IntTag:
          result.push([identifier, tag.valueOf()]);
          break;
        case ByteTag:
          result.push([identifier, tag.valueOf() !== 0]);
          break;
      }
    }

    // Return the result array
    return result;
  }

  /**
   * Check if the entity has a shared property with the given identifier.
   * @param identifier The identifier of the property.
   * @returns True if the property exists, false otherwise.
   */
  public hasSharedProperty(identifier: string): boolean {
    return this.getAllSharedProperties().some(([key]) => key === identifier);
  }

  /**
   * Get the shared property of the entity that is shared with the client.
   * @param identifier The identifier of the property.
   * @returns The value of the property.
   * @throws Error if the property does not exist on the entity type.
   */
  public getSharedProperty<T extends SharedPropertyValue>(
    identifier: string
  ): T {
    // Validate that the property exists on the entity type
    if (!this.entity.type.hasProperty(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the properties storage from the entity
    const storage = this.entity.getStorageEntry<CompoundTag>(
      EntitySharedProperties.PROPERTIES_KEY
    );

    // If there is no properties storage, throw an error
    if (!storage) {
      throw new Error(
        `The entity "${this.entity.type.identifier}" is missing its properties storage. This indicates a logic error.`
      );
    }

    // Iterate over the properties map
    for (const [key, property] of storage.entries()) {
      // Check if the key matches the identifier
      if (key === identifier) {
        // Cast the property to the appropriate tag type
        const tag = property as StringTag | FloatTag | IntTag | ByteTag;

        // Switch based on the tag type and return the value
        switch (tag.constructor) {
          case StringTag:
            return tag.valueOf() as T;
          case FloatTag:
            return tag.valueOf() as T;
          case IntTag:
            return tag.valueOf() as T;
          case ByteTag:
            return (tag.valueOf() !== 0) as T;
        }
      }
    }

    // Throw an error if the property is not found
    throw new Error(
      `Property "${identifier}" not found on entity instance "${this.entity.type.identifier}" but it exists on the entity type. This indicates a logic error.`
    );
  }

  /**
   * Sets the shared property of the entity that is shared with the client.
   * @param identifier The identifier of the property.
   * @param value The value of the property.
   */
  public setSharedProperty<T extends SharedPropertyValue>(
    identifier: string,
    value: T
  ): void {
    // Validate that the property exists on the entity type
    if (!this.entity.type.hasProperty(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the storage from the entity
    const storage = this.entity.getStorageEntry<CompoundTag>(
      EntitySharedProperties.PROPERTIES_KEY
    );

    // If there is no storage, throw an error
    if (!storage) {
      throw new Error(
        `The entity "${this.entity.type.identifier}" is missing its properties storage. This indicates a logic error.`
      );
    }

    // Get the property from the entity type
    const property = this.entity.type.getProperty(identifier) as EntityProperty;

    // Validate the value based on the property type
    switch (property.getType()) {
      case EntityPropertyType.Int: {
        // Validate that the value is a number
        if (typeof value !== "number" || !Number.isInteger(value))
          throw new Error(
            `Property "${identifier}" must be an integer, received "${typeof value}"`
          );

        // Cast the property to an integer property
        const intProperty = property as EntityIntProperty;

        // Validate that the value is within the min and max range
        if (value < intProperty.getMin() || value > intProperty.getMax())
          throw new Error(
            `Property "${identifier}" must be between ${intProperty.getMin()} and ${intProperty.getMax()}, received ${value}`
          );

        // Set the value in the storage
        storage.set(identifier, new IntTag(value, identifier));
        break;
      }

      case EntityPropertyType.Float: {
        // Validate that the value is a number
        if (typeof value !== "number")
          throw new Error(
            `Property "${identifier}" must be a float, received "${typeof value}"`
          );

        // Cast the property to a float property
        const floatProperty = property as EntityFloatProperty;

        // Validate that the value is within the min and max range
        if (value < floatProperty.getMin() || value > floatProperty.getMax())
          throw new Error(
            `Property "${identifier}" must be between ${floatProperty.getMin()} and ${floatProperty.getMax()}, received ${value}`
          );

        // Set the value in the storage
        storage.set(identifier, new FloatTag(value, identifier));
        break;
      }

      case EntityPropertyType.Boolean: {
        // Validate that the value is a boolean
        if (typeof value !== "boolean")
          throw new Error(
            `Property "${identifier}" must be a boolean, received "${typeof value}"`
          );

        // Set the value in the storage
        storage.set(identifier, new ByteTag(value ? 1 : 0, identifier));
        break;
      }

      case EntityPropertyType.Enum: {
        // Validate that the value is a string
        if (typeof value !== "string")
          throw new Error(
            `Property "${identifier}" must be a string, received "${typeof value}"`
          );

        // Cast the property to a boolean property
        const enumProperty = property as EntityEnumProperty;

        // Validate that the value is within the allowed values
        if (!enumProperty.getEnum().includes(value))
          throw new Error(
            `Property "${identifier}" must be one of ${enumProperty
              .getEnum()
              .map((v) => `"${v}"`)
              .join(", ")}, received "${value}"`
          );

        // Set the value in the storage
        storage.set(identifier, new StringTag(value, identifier));
        break;
      }
    }

    // Create a new SetActorDataPacket
    const packet = new SetActorDataPacket();
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputInfo.tick
      : this.entity.dimension.world.currentTick;
    packet.data = this.entity.metadata.getAllActorMetadataAsDataItems();
    packet.properties = this.getSharedPropertiesAsSyncData();

    // Iterate over the flags set on the entity
    for (const [flat, enabled] of this.entity.flags.getAllActorFlags())
      packet.setActorFlag(flat, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }

  /**
   * Reset the shared property of the entity to its default value.
   * @param identifier The identifier of the property.
   */
  public resetSharedProperty(identifier: string): void {
    // Validate that the property exists on the entity type
    if (!this.entity.type.hasProperty(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the property from the entity type
    const property = this.entity.type.getProperty(identifier) as EntityProperty;

    // Reset the value of the property based on its type
    switch (property.getType()) {
      case EntityPropertyType.Int: {
        // Cast the property to an integer property
        const intProperty = property as EntityIntProperty;

        // Reset the value of the property to its default value or min value
        return this.setSharedProperty(identifier, intProperty.getMin());
      }

      case EntityPropertyType.Float: {
        // Cast the property to a float property
        const floatProperty = property as EntityFloatProperty;

        // Reset the value of the property to its default value or min value
        return this.setSharedProperty(identifier, floatProperty.getMin());
      }

      case EntityPropertyType.Boolean: {
        // Reset the value of the property to its default value or false
        return this.setSharedProperty(identifier, false);
      }

      case EntityPropertyType.Enum: {
        // Cast the property to a boolean property
        const enumProperty = property as EntityEnumProperty;

        // Reset the value of the property to its default value or the first value in the enum
        return this.setSharedProperty(identifier, enumProperty.getEnum()[0]!);
      }
    }
  }

  /**
   * Get the shared properties of the entity as a PropertySyncData object.
   * This is used to sync the properties with the client.
   * @returns The PropertySyncData object.
   */
  public getSharedPropertiesAsSyncData(): PropertySyncData {
    // Create a new SetActorDataPacket
    const property = new PropertySyncData([], []);

    // Sort the key list to ensure the order is consistent
    const keys = [...this.getAllSharedProperties().map(([key]) => key)].sort();
    for (const [index, key] of keys.entries()) {
      // Get the value from the map
      const value = this.getSharedProperty(key);

      // Check if the value is a int property
      if (typeof value === "number" && Number.isInteger(value)) {
        // Push the value to the ints
        property.ints.push({ index, value });
      }
      // Check if the value is a float property
      else if (typeof value === "number" && !Number.isInteger(value)) {
        // Push the value to the floats
        property.floats.push({ index, value });
      }
      // Check if the value is a boolean property
      else if (typeof value === "boolean") {
        // Push the value to the ints
        property.ints.push({ index, value: value ? 1 : 0 });
      }
      // Check if the value is an enum property
      else if (typeof value === "string") {
        // Get the property from the entity type
        const definition = this.entity.type.getProperty(
          key
        ) as EntityEnumProperty;

        // Get the index of the value in the enum
        const enumValue = definition.getEnum().indexOf(value);

        // Push the value to the ints
        property.ints.push({ index, value: enumValue });
      }
    }

    // Return the property sync data
    return property;
  }
}

export { EntitySharedProperties };
