import {
  ActorFlag,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { EntityFlagUpdateSignal } from "../../events";

class ActorFlagMap extends Map<ActorFlag, boolean> {
  /**
   * The entity that this actor flags map is attached to
   */
  protected readonly entity: Entity;

  /**
   * Create a new actor flags map
   * @param entity The entity that this actor flags map is attached to
   */
  public constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  public set(key: ActorFlag, value: boolean): this {
    // Create a new EntityFlagUpdateSignal
    const signal = new EntityFlagUpdateSignal(this.entity, key, value);

    // If the signal was cancelled, return this
    if (!signal.emit()) return this;

    // Call the original set method
    const result = super.set(key, signal.value);

    // Update the actor data when a new value is added
    this.update();

    // Return the result
    return result;
  }

  public delete(key: ActorFlag): boolean {
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

    // Update the actor data when the map is cleared
    this.update();
  }

  /**
   * Update the actor data of the entity.
   */
  public update(): void {
    // Create a new SetActorDataPacket
    const packet = new SetActorDataPacket();
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputTick
      : this.entity.dimension.world.currentTick;
    packet.data = [...this.entity.metadata.values()];
    packet.properties = new PropertySyncData([], []);

    // Iterate over the flags set on the entity
    for (const [flag, enabled] of this.entity.flags)
      packet.setActorFlag(flag, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { ActorFlagMap };
