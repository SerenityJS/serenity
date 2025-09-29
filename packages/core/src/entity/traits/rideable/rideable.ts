import {
  ActorLink,
  ActorLinkType,
  SetActorLinkPacket
} from "@serenityjs/protocol";

import { EntityInteractMethod } from "../../../enums";
import { Player } from "../../player";
import { Entity } from "../../entity";
import { EntityTrait } from "../trait";
import { JSONLikeObject } from "../../../types";

import { EntityRidingTrait } from "./riding";
import { RideableSeat, RideableSeatOptions } from "./seat";

interface EntityRideableTraitOptions extends JSONLikeObject {
  seats: Array<RideableSeatOptions>;
}

class EntityRideableTrait extends EntityTrait {
  public static readonly identifier = "rideable";

  /**
   * The seat and entity that is riding on this entity.
   */
  private readonly riders: Map<number, bigint> = new Map();

  /**
   * The seat options for the entity.
   */
  private readonly seats: Set<RideableSeat> = new Set();

  /**
   * Creates a new instance of the entity rideable trait.
   * @param entity The entity that this trait will be attached to.
   * @param options The options for the entity rideable trait.
   */
  public constructor(entity: Entity, options?: EntityRideableTraitOptions) {
    super(entity);

    // Iterate over the provided seat options
    for (const seat of options?.seats ?? []) {
      // Create a new RideableSeat instance and add it to the set of seats
      const seatInstance = new RideableSeat(seat);

      // Add the seat instance to the set of seats
      this.seats.add(seatInstance);
    }
  }

  /**
   * The dynamic property for the rideable trait.
   */
  public get property(): EntityRideableTraitOptions {
    // Return the dynamic property for the rideable trait
    return this.entity
      .getStorage()
      .getDynamicProperty(this.identifier) as EntityRideableTraitOptions;
  }

  /**
   * Set the dynamic property for the rideable trait.
   * @param value The value to set for the dynamic property.
   */
  public set property(value: EntityRideableTraitOptions) {
    // Check if the entity has a dynamic property for the rideable trait
    this.entity.getStorage().setDynamicProperty(this.identifier, value);
  }

  /**
   * Check if the entity has available seats.
   * @returns True if the entity has available seats, false otherwise.
   */
  public hasAvailableSeats(): boolean {
    // Check if the number of riders is less than the number of seats
    return this.riders.size < this.seats.size;
  }

  /**
   * Get the next available seat for the entity.
   * @returns The next available seat, or null if no seats are available.
   */
  public getNextAvailableSeat(): RideableSeat | null {
    // Iterate over the set of seats
    for (const seat of this.seats) {
      // Check if the seat index is not already occupied by a rider
      if (!this.riders.has(seat.index)) return seat;
    }

    // If no available seat index is found, return null
    return null;
  }

  /**
   * Get all riders of the entity.
   * @returns An array of tuples containing the rider entity and the seat they are in.
   */
  public getRiders(): Array<[Entity, RideableSeat]> {
    // Prepare an array to hold the riders
    const riders: Array<[Entity, RideableSeat]> = [];

    // Iterate over the set of riders
    for (const [seatIndex, uniqueId] of this.riders) {
      // Get the rider entity from the dimension
      const rider = this.dimension.getEntity(uniqueId);

      // Check if the rider entity exists
      if (!rider) continue;

      // Get the seat for the rider
      const seat = [...this.seats][seatIndex];

      // Check if the seat exists
      if (!seat) continue;

      // Add the rider entity to the array
      riders.push([rider, seat]);
    }

    // Return the array of riders
    return riders;
  }

  /**
   * Add a rider to the entity.
   * @param entity The entity to add as a rider.
   * @returns True if the rider was added successfully, false otherwise.
   */
  public addRider(entity: Entity): boolean {
    // Check if there are enough seats for the entity
    if (!this.hasAvailableSeats()) return false;

    // Get the next available seat
    const seat = this.getNextAvailableSeat();

    // Check if the seat index is valid
    if (!seat) return false;

    // Create a new SetActorLinkPacket to link the entity to the rideable entity
    const packet = new SetActorLinkPacket();
    packet.link = new ActorLink(
      this.entity.uniqueId,
      entity.uniqueId,
      ActorLinkType.Rider,
      true,
      true,
      0
    );

    // Broadcast the packet to the dimension
    this.dimension.broadcast(packet);

    // Add the entity to the set of riders
    this.riders.set(seat.index, entity.uniqueId);

    // Create a new riding trait for the entity and set the seat position
    const riding = entity.addTrait(EntityRidingTrait, this.entity);

    // Set the seat position and rotation for the riding trait
    riding.setSeatPosition(seat.position);
    riding.setSeatLockRotation(seat.lockRotation);
    riding.setSeatRotation(seat.seatRotation);

    // Return true to indicate that the entity was added successfully
    return true;
  }

  /**
   * Remove a rider from the entity.
   * @param entity The entity to remove as a rider.
   */
  public removeRider(entity: Entity): void {
    // Create a new SetActorLinkPacket to unlink the entity from the rideable entity
    const packet = new SetActorLinkPacket();
    packet.link = new ActorLink(
      this.entity.uniqueId,
      entity.uniqueId,
      ActorLinkType.Remove,
      true,
      true,
      0
    );

    // Broadcast the packet to the dimension
    this.dimension.broadcast(packet);

    // Remove the entity from the set of riders
    for (const [index, riderId] of this.riders) {
      // Check if the rider ID matches the entity's unique ID
      if (riderId === entity.uniqueId) {
        // Remove the rider from the set
        this.riders.delete(index);
        break;
      }
    }

    // Remove the riding trait from the entity
    entity.removeTrait(EntityRidingTrait);
  }

  /**
   * Clear all riders from the entity.
   */
  public clearRiders(): void {
    // Iterate over the set of riders
    for (const [, uniqueId] of this.riders) {
      // Get the rider entity from the dimension
      const entity = this.dimension.getEntity(uniqueId);

      // Check if the rider entity exists
      if (!entity) continue;

      // Remove the entity from the set of riders
      this.removeRider(entity);
    }
  }

  /**
   * Create a new rideable seat for the entity.
   * @param options The options for the rideable seat.
   * @returns The created rideable seat.
   */
  public createSeat(options: Partial<RideableSeatOptions>): RideableSeat {
    // Get the next available seat index
    const index = this.seats.size;

    // Create a new RideableSeat instance with the provided options
    const seat = new RideableSeat({ ...options, index });

    // Add the seat to the set of seats
    this.addSeat(seat);

    // Return the created seat
    return seat;
  }

  /**
   * Add a rideable seat to the entity.
   * @param seat The rideable seat to add.
   */
  public addSeat(seat: RideableSeat): void {
    // Add the seat to the set of seats
    this.seats.add(seat);

    // Get the dynamic property for the rideable trait
    const property = this.property;

    // Push the seat to the dynamic property
    property.seats.push(seat.toJson());

    // Set the dynamic property for the rideable trait
    this.property = property;
  }

  /**
   * Remove a rideable seat from the entity.
   * @param seat The rideable seat to remove.
   */
  public removeSeat(seat: RideableSeat): void {
    // Remove the seat from the set of seats
    this.seats.delete(seat);

    // Get the dynamic property for the rideable trait
    const property = this.property;

    // Remove the seat from the dynamic property
    property.seats = property.seats.filter((s) => s.index !== seat.index);

    // Set the dynamic property for the rideable trait
    this.property = property;
  }

  /**
   * Clear all seats from the entity.
   */
  public clearSeats(): void {
    // Iterate over the set of seats
    for (const seat of this.seats) {
      // Remove the seat from the set
      this.removeSeat(seat);
    }
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the player interacted with the entity
    if (method !== EntityInteractMethod.Interact || player.isSneaking) return;

    // Check if the entity has available seats
    if (!this.hasAvailableSeats()) return;

    // Check if the player is riding a different entity
    if (player.hasTrait(EntityRidingTrait)) {
      // Get the riding trait from the player
      const riding = player.getTrait(EntityRidingTrait);

      // Remove the player from the previous entity
      riding.getRideableTrait().removeRider(player);
    }

    // Add the player as a rider to the entity
    this.addRider(player);
  }

  public onAdd(): void {
    // Check if the entity has a dynamic property for the rideable trait
    if (!this.property) {
      // Create a new dynamic property for the rideable trait
      const property: EntityRideableTraitOptions = {
        seats: [...this.seats].map((seat) => seat.toJson()),
        riders: [...this.riders].map((rider) => Number(rider))
      };

      // Set the dynamic property for the rideable trait
      this.property = property;
    }

    // Check if the property has seats
    if (this.property.seats.length > 0) {
      // Iterate over the seats in the property
      for (const seat of this.property.seats) {
        // Create a new RideableSeat instance and add it to the set of seats
        const seatInstance = new RideableSeat(seat);

        // Add the seat instance to the set of seats
        this.seats.add(seatInstance);
      }
    }
    // If not, create a default seat
    else this.createSeat({ driver: true, position: [0, 1, 0] });
  }

  public onRemove(): void {
    // Remove the dynamic property for the rideable trait
    this.entity.getStorage().removeDynamicProperty(this.identifier);

    // Iterate over the riders in the set
    for (const [, uniqueId] of this.riders) {
      // Get the rider entity from the dimension
      const entity = this.dimension.getEntity(uniqueId);

      // Check if the rider entity exists
      if (!entity) continue;

      // Remove the riding trait from the rider entity
      entity.removeTrait(EntityRidingTrait);
    }

    // Clear the set of riders
    this.riders.clear();
  }
}

export { EntityRideableTrait };
