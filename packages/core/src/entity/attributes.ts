import {
  Attribute,
  AttributeName,
  UpdateAttributesPacket
} from "@serenityjs/protocol";
import { CompoundTag, FloatTag, ListTag, StringTag } from "@serenityjs/nbt";

import { Entity } from "./entity";

class EntityAttributes {
  /**
   * The storage key for attributes.
   */
  private static readonly ATTRIBUTE_KEY = "Attributes";

  /**
   * The entity that attribute set is attached to.
   */
  private readonly entity: Entity;

  /**
   * The attributes map holding attribute names and their corresponding CompoundTag representations.
   */
  private readonly attributes = new Map<AttributeName, CompoundTag>();

  /**
   * Create a new EntityAttributes instance.
   * @param entity The entity that attribute set is attached to.
   */
  public constructor(entity: Entity) {
    // Assign the entity to the private field
    this.entity = entity;

    // Get the initial attributes from the entity's storage
    const attributes = entity.getStorageEntry<ListTag<CompoundTag>>(
      EntityAttributes.ATTRIBUTE_KEY
    );

    // If there are no attributes, return early
    if (!attributes) return;

    // Populate the attributes map
    for (const attribute of attributes.values()) {
      // Get the name of the attribute
      const name = attribute.get<StringTag>("Name");

      // If the name exists, add the attribute to the map
      if (name) this.attributes.set(name.valueOf() as AttributeName, attribute);
    }
  }

  /**
   * Get all the attributes of the entity.
   * @returns An array of attributes.
   */
  public getAllAttributes(): Array<Attribute> {
    // Create a new array to hold the attributes
    const attributes: Array<Attribute> = [];

    // Iterate over the attributes map
    for (const [name, attribute] of this.attributes) {
      // Convert the CompoundTag to an Attribute and add it to the array
      const min = attribute.get<FloatTag>("Min")?.valueOf() ?? 0;
      const max = attribute.get<FloatTag>("Max")?.valueOf() ?? 0;
      const current = attribute.get<FloatTag>("Current")?.valueOf() ?? 0;
      const base = attribute.get<FloatTag>("Base")?.valueOf() ?? 0;
      const defaultMax = attribute.get<FloatTag>("DefaultMax")?.valueOf() ?? 0;
      const defaultMin = attribute.get<FloatTag>("DefaultMin")?.valueOf() ?? 0;

      // Push the attribute to the array
      attributes.push(
        new Attribute(min, max, current, defaultMin, defaultMax, base, name, [])
      );
    }

    // Return the array of attributes
    return attributes;
  }

  /**
   * Check if the entity has an attribute by name.
   * @param name The name of the attribute.
   * @returns True if the attribute exists, false otherwise.
   */
  public hasAttribute(name: AttributeName): boolean {
    return this.attributes.has(name);
  }

  /**
   * Get an attribute by name.
   * @param name The name of the attribute.
   * @returns The attribute, or null if it does not exist.
   */
  public getAttribute(name: AttributeName): Attribute | null {
    // Get the attribute from the map
    const attribute = this.attributes.get(name);

    // If the attribute does not exist, return null
    if (!attribute) return null;

    // Convert the CompoundTag to an Attribute and return it
    const min = attribute.get<FloatTag>("Min")?.valueOf() ?? 0;
    const max = attribute.get<FloatTag>("Max")?.valueOf() ?? 0;
    const current = attribute.get<FloatTag>("Current")?.valueOf() ?? 0;
    const base = attribute.get<FloatTag>("Base")?.valueOf() ?? 0;
    const defaultMax = attribute.get<FloatTag>("DefaultMax")?.valueOf() ?? 0;
    const defaultMin = attribute.get<FloatTag>("DefaultMin")?.valueOf() ?? 0;

    // Return the attribute as an Attribute object
    return new Attribute(
      min,
      max,
      current,
      defaultMin,
      defaultMax,
      base,
      name,
      []
    );
  }

  /**
   * Set an attribute for the entity.
   * @param attribute The attribute to set.
   */
  public setAttribute(attribute: Attribute): void {
    // Create a CompoundTag from the Attribute
    const tag = new CompoundTag();
    tag.set("Name", new StringTag(attribute.name));
    tag.set("Min", new FloatTag(attribute.min));
    tag.set("Max", new FloatTag(attribute.max));
    tag.set("Current", new FloatTag(attribute.current));
    tag.set("Base", new FloatTag(attribute.default));
    tag.set("DefaultMin", new FloatTag(attribute.defaultMin));
    tag.set("DefaultMax", new FloatTag(attribute.defaultMax));

    // Set the attribute in the map
    this.attributes.set(attribute.name, tag);

    // Create a new UpdateAttributesPacket
    const packet = new UpdateAttributesPacket();
    packet.runtimeActorId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputInfo.tick
      : this.entity.world.currentTick;

    // NOTE: We dont't need to resend all attributes if only one attribute is updated
    packet.attributes = [attribute];

    // Send the packet to the entity's dimension
    this.entity.dimension.broadcast(packet);

    // Create a new ListTag to hold the attributes
    const attributesList = new ListTag<CompoundTag>(this.attributes.values());

    // Update the entity's storage with the new attributes
    this.entity.setStorageEntry(EntityAttributes.ATTRIBUTE_KEY, attributesList);
  }

  /**
   * Remove an attribute by name.
   * @param name The name of the attribute.
   */
  public removeAttribute(name: AttributeName): void {
    // Delete the attribute from the map
    this.attributes.delete(name);

    // Create a new UpdateAttributesPacket
    const packet = new UpdateAttributesPacket();
    packet.runtimeActorId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputInfo.tick
      : this.entity.world.currentTick;
    packet.attributes = this.getAllAttributes();

    // Send the packet to the entity's dimension
    this.entity.dimension.broadcast(packet);

    // Create a new ListTag to hold the attributes
    const attributesList = new ListTag<CompoundTag>(this.attributes.values());

    // Update the entity's storage with the new attributes
    this.entity.setStorageEntry(EntityAttributes.ATTRIBUTE_KEY, attributesList);
  }
}

export { EntityAttributes };
