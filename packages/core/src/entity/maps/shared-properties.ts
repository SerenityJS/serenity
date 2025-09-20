import { PropertySyncData, SetActorDataPacket } from "@serenityjs/protocol";

import { Entity } from "../entity";
import {
  EntityBooleanProperty,
  EntityEnumProperty,
  EntityFloatProperty,
  EntityIntProperty,
  EntityProperty
} from "../identity";

class EntitySharedPropertiesMap extends Map<string, number | boolean | string> {
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
    super();

    // Assign the entity to the property map
    this.entity = entity;

    // Copy the properties from the entity type
    for (const [key, value] of entity.type.properties)
      this.properties.set(key, value);
  }

  /**
   * Get a property from the entity
   * @param identifier The identifier of the property
   * @returns The value of the property
   */
  public get(identifier: string): number | boolean | string | undefined {
    // Check if the property exists on the entity type
    if (!this.properties.has(identifier)) return undefined;

    // Get the property from the map
    const property = this.properties.get(identifier) as EntityProperty;

    // Check if the property is a int property
    return property.currentValue;
  }

  /**
   * Set a property on the entity
   * @param identifier The identifier of the property
   * @param value The value of the property
   * @returns The entity property map.
   */
  public set(identifier: string, value: number | boolean | string): this {
    // Check if the property exists on the entity type
    if (!this.properties.has(identifier)) return this;

    // Get the property from the map
    const property = this.properties.get(identifier) as EntityProperty;

    // Check if the property is a int property
    property.currentValue = value;

    // Call the original set method
    super.set(identifier, value);

    // Update the actor data when a new value is added
    this.update();

    // Return the map
    return this;
  }

  /**
   * Delete a property from the entity
   * @param identifier The identifier of the property
   * @returns True if the property was deleted, false otherwise.
   */
  public delete(identifier: string): boolean {
    // Check if the property exists on the entity type
    if (!this.properties.has(identifier)) return false;

    // Call the original delete method
    const result = super.delete(identifier);

    // Update the actor data when a value is deleted
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the actor data when the map is cleared
    this.update();
  }

  public update(): void {
    // Create a new SetActorDataPacket
    const packet = new SetActorDataPacket();
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputInfo.tick
      : this.entity.dimension.world.currentTick;
    packet.data = [...this.entity.metadata.values()];
    packet.properties = this.getPropertySyncData();

    // Iterate over the flags set on the entity
    for (const [flag, enabled] of this.entity.flags)
      packet.setActorFlag(flag, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }

  /**
   * Get the property map as a PropertySyncData object
   * @returns The property sync data object
   */
  public getPropertySyncData(): PropertySyncData {
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

export { EntitySharedPropertiesMap };
