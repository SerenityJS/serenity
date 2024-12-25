import {
  Attribute,
  AttributeName,
  UpdateAttributesPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { EntityAttributeUpdateSignal } from "../../events";

class AttributeMap extends Map<AttributeName, Attribute> {
  /**
   * The entity that this metadata set is attached to
   */
  protected readonly entity: Entity;

  /**
   * Create a new metadata set
   * @param entity The entity that this metadata set is attached to
   */
  public constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  public set(key: AttributeName, value: Attribute): this {
    // Create a new EntityAttributeUpdateSignal
    const signal = new EntityAttributeUpdateSignal(this.entity, key, value);

    // If the signal was cancelled, return this
    if (!signal.emit()) return this;

    // Call the original set method
    const result = super.set(key, signal.value);

    // Update the actor data when a new value is added
    this.update(value);

    // Return the result
    return result;
  }

  public add(value: Attribute): this {
    return this.set(value.name, value);
  }

  public delete(key: AttributeName): boolean {
    // Call the original delete method
    const result = super.delete(key);

    // Update the actor data when a value is deleted
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the actor data when the set is cleared
    this.update();
  }

  /**
   * Update the actor data of the entity.
   */
  public update(attribute?: Attribute): void {
    // Create a new UpdateAttributesPacket
    const packet = new UpdateAttributesPacket();
    packet.runtimeActorId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputTick
      : this.entity.dimension.world.currentTick;

    // NOTE: You don't need to resend all attributes if only one attribute is updated
    // So we only send the updated attribute if it's provided
    packet.attributes = attribute
      ? [attribute]
      : Array.from(this.entity.attributes.values());

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { AttributeMap };
