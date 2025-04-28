import {
  ActorDataId,
  ActorDataType,
  ActorFlag,
  DataItem,
  Vector3f
} from "@serenityjs/protocol";

import { Entity } from "../../entity";
import { EntityTrait } from "../trait";

import { EntityRideableTrait } from "./rideable";
import { RideableSeat } from "./seat";

class EntityRidingTrait extends EntityTrait {
  public static readonly identifier = "riding";

  /**
   * The entity that this entity is riding on.
   */
  public readonly entityRidingOn: Entity;

  /**
   * Creates a new instance of the entity riding trait.
   * @param entity The entity that this trait is attached to.
   * @param target The entity that this entity is riding on.
   */
  public constructor(entity: Entity, target: Entity) {
    super(entity);

    // Set the entity that this entity is riding on.
    this.entityRidingOn = target;
  }

  /**
   * Set the seat position of the entity.
   * @param position The position of the seat.
   */
  public setSeatPosition(position: Vector3f): void {
    // Create a new data item for the seat position.
    const seatPosition = new DataItem(
      ActorDataId.SeatPosition,
      ActorDataType.Vec3,
      position
    );

    // Update the seat position data item in the entity's metadata.
    this.entity.metadata.push(seatPosition);
  }

  /**
   * Set the seat lock rotation of the entity.
   * @param rotation The rotation of the seat lock.
   */
  public setSeatLockRotation(rotation: number): void {
    // Create a new data item for the seat lock rotation.
    const seatLockRotation = new DataItem(
      ActorDataId.SeatLockPassengerRotation,
      ActorDataType.Float,
      rotation
    );

    // Update the seat lock rotation data item in the entity's metadata.
    this.entity.metadata.push(seatLockRotation);
  }

  /**
   * Set the seat rotation of the entity.
   * @param rotation The rotation of the seat.
   */
  public setSeatRotation(rotation: number): void {
    // Create a new data item for the seat rotation.
    const seatRotation = new DataItem(
      ActorDataId.SeatRotationOffset,
      ActorDataType.Float,
      rotation
    );

    // Update the seat rotation data item in the entity's metadata.
    this.entity.metadata.push(seatRotation);
  }

  /**
   * Get the seat of the entity that this entity is riding on.
   * @returns The rideable seat of the entity that this entity is riding on.
   */
  public getSeat(): RideableSeat | null {
    // Iterate over the riders of the entity that this entity is riding on.
    for (const [entity, seat] of this.getRideableTrait().getRiders()) {
      // Check if the entity is the one that this entity is rider.
      if (entity === this.entity) return seat; // If so, return the seat.
    }

    // If no seat is found, return null.
    return null;
  }

  /**
   * Get the rideable trait from the entity that this entity is riding on.
   * @returns The rideable trait of the entity that this entity is riding on.
   */
  public getRideableTrait(): EntityRideableTrait {
    // Get the rideable trait from the entity that this entity is riding on.
    return this.entityRidingOn.getTrait(EntityRideableTrait);
  }

  public onAdd(): void {
    // Set the riding flag on the entity.
    this.entity.flags.set(ActorFlag.Riding, true);

    // Check if the target entity has the rideable trait.
    if (!this.entityRidingOn.hasTrait(EntityRideableTrait))
      return this.entity.removeTrait(this.identifier); // If not, remove the riding trait.
  }

  public onRemove(): void {
    // Remove the riding flag from the entity.
    this.entity.flags.delete(ActorFlag.Riding);
  }
}

export { EntityRidingTrait };
