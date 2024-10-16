import {
  Attribute,
  AttributeName,
  UpdateAttributesPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";

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
    // Call the original set method
    const result = super.set(key, value);

    // Update the actor data when a new value is added
    this.update();

    // Return the result
    return result;
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
  public update(): void {
    // Create a new UpdateAttributesPacket
    const packet = new UpdateAttributesPacket();
    packet.runtimeActorId = this.entity.runtimeId;
    packet.tick = this.entity.dimension.world.currentTick;
    packet.attributes = [...this.entity.attributes.values()];

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { AttributeMap };
