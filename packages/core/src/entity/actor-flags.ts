import { ActorFlag, SetActorDataPacket } from "@serenityjs/protocol";

import { Entity } from "./entity";

class EntityActorFlags {
  /**
   * The entity that this actor flags map is attached to.
   */
  private readonly entity: Entity;

  /**
   * The map of actor flags for this entity.
   */
  private readonly flags = new Map<ActorFlag, boolean>();

  /**
   * Create a new EntityActorFlags instance.
   * @param entity The entity that this actor flags map is attached to.
   */
  public constructor(entity: Entity) {
    // Assign the entity to the private field
    this.entity = entity;
  }

  /**
   * Get all actor flags as an array of tuples.
   * @returns An array of tuples containing the actor flags and their values.
   */
  public getAllActorFlags(): Array<[ActorFlag, boolean]> {
    return Array.from(this.flags.entries());
  }

  /**
   * Get the value of an actor flag.
   * @param flag The actor flag to get the value of.
   * @returns The value of the actor flag, or false if it is not set.
   */
  public getActorFlag(flag: ActorFlag): boolean {
    // Return the value of the flag, or false if it is not set
    return this.flags.get(flag) ?? false;
  }

  /**
   * Set the value of an actor flag.
   * @param flag The actor flag to set the value of.
   * @param value The value to set the actor flag to. If null or undefined, the flag will be deleted.
   */
  public setActorFlag(flag: ActorFlag, value?: boolean | null): void {
    // Check if the value is null or undefined, if so delete the flag
    if (value === null || value === undefined) {
      this.flags.delete(flag);
    } else {
      this.flags.set(flag, value);
    }

    // Create a new SetActorDataPacket
    const packet = new SetActorDataPacket();
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputInfo.tick
      : this.entity.dimension.world.currentTick;
    packet.data = this.entity.metadata.getAllActorMetadataAsDataItems();
    packet.properties =
      this.entity.sharedProperties.getSharedPropertiesAsSyncData();

    // Iterate over the flags set on the entity
    for (const [flat, enabled] of this.flags)
      packet.setActorFlag(flat, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { EntityActorFlags };
