import {
  EntityPropertyType,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";

import { Entity } from "./entity";
import {
  EntityBooleanProperty,
  EntityEnumProperty,
  EntityFloatProperty,
  EntityIntProperty,
  EntityProperty
} from "./identity";

type SharedPropertyValue = string | number | boolean;

class EntitySharedProperties {
  /**
   * The entity that this property map is attached to.
   */
  private readonly entity: Entity;

  /**
   * The current properties of the entity.
   */
  private readonly properties = new Map<string, EntityProperty>();

  /**
   * Create a new entity property map
   * @param entity The entity that this property map is attached to
   */
  public constructor(entity: Entity) {
    // Assign the entity to the property map
    this.entity = entity;

    // Copy the properties from the entity type
    for (const [key, value] of entity.type.getAllProperties())
      this.properties.set(key, value);
  }

  /**
   * Get all the shared properties of the entity that are shared with the client.
   * @returns An array of tuples containing the identifier and value of each property.
   */
  public getAllSharedProperties(): Array<[string, SharedPropertyValue]> {
    // Prepare the result array
    const result: Array<[string, SharedPropertyValue]> = [];

    // Iterate over the properties and add them to the result array
    for (const [key, value] of this.properties)
      result.push([key, value.currentValue as SharedPropertyValue]);

    // Return the result array
    return result;
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
    if (!this.properties.has(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the property from the entity type
    const property = this.properties.get(identifier) as EntityProperty;

    // Return the current value of the property
    return property.currentValue as T;
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
    if (!this.properties.has(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the property from the entity type
    const property = this.properties.get(identifier) as EntityProperty;

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

        // Set the value of the property
        intProperty.currentValue = value;
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

        // Set the value of the property
        floatProperty.currentValue = value;
        break;
      }

      case EntityPropertyType.Boolean: {
        // Validate that the value is a boolean
        if (typeof value !== "boolean")
          throw new Error(
            `Property "${identifier}" must be a boolean, received "${typeof value}"`
          );

        // Cast the property to a boolean property
        const booleanProperty = property as EntityBooleanProperty;

        // Set the value of the property
        booleanProperty.currentValue = value;
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

        // Set the value of the property
        enumProperty.currentValue = value;
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
    if (!this.properties.has(identifier)) {
      // Throw an error if the property does not exist
      throw new Error(
        `Property "${identifier}" does not exist on entity type "${this.entity.type.identifier}"`
      );
    }

    // Get the property from the entity type
    const property = this.properties.get(identifier) as EntityProperty;

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
    const keys = [...this.properties.keys()].sort();
    for (const [index, key] of keys.entries()) {
      // Get the value from the map
      const value = this.properties.get(key) as EntityProperty;

      // Check if the value is a int property
      if (value instanceof EntityIntProperty) {
        // Push the value to the ints
        property.ints.push({ index, value: value.currentValue });
      }
      // Check if the value is a float property
      else if (value instanceof EntityFloatProperty) {
        // Push the value to the floats
        property.floats.push({ index, value: value.currentValue });
      }
      // Check if the value is a boolean property
      else if (value instanceof EntityBooleanProperty) {
        // Push the value to the ints
        property.ints.push({ index, value: value.currentValue ? 1 : 0 });
      }
      // Check if the value is an enum property
      else if (value instanceof EntityEnumProperty) {
        // Get the index of the value in the enum
        const enumValue = value.getEnum().indexOf(value.currentValue);

        // Push the value to the ints
        property.ints.push({ index, value: enumValue });
      }
    }

    // Return the property sync data
    return property;
  }
}

export { EntitySharedProperties };
