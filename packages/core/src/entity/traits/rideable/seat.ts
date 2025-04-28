import { Vector3f } from "@serenityjs/protocol";

import { JSONLikeObject } from "../../../types";

interface RideableSeatOptions extends JSONLikeObject {
  /**
   * The seat index of the rideable seat.
   */
  index: number;

  /**
   * Whether the seat is a driver seat or not.
   */
  driver: boolean;

  /**
   * The seat position offset relative to the entity's position.
   */
  position: [number, number, number];

  /**
   * The angle in degrees that a rider is allowed to rotate in the seat.
   */
  lockRotation: number;

  /**
   * The angle in degrees that the seat is rotated.
   */
  seatRotation: number;
}

class RideableSeat {
  /**
   * The seat index of the rideable seat.
   */
  public readonly index: number;

  /**
   * Whether the seat is a driver seat or not.
   */
  public readonly driver: boolean;

  /**
   * The seat position offset relative to the entity's position.
   */
  public readonly position: Vector3f;

  /**
   * The angle in degrees that a rider is allowed to rotate in the seat.
   */
  public readonly lockRotation: number;

  /**
   * The angle in degrees that the seat is rotated.
   */
  public readonly seatRotation: number;

  /**
   * Create a new rideable seat instance.
   * @param options The options for the rideable seat.
   */
  public constructor(options: Partial<RideableSeatOptions>) {
    // Assign the default values for lockRotation and seatRotation
    this.index = options.index ?? -1;
    this.driver = options.driver ?? false;
    this.lockRotation = options.lockRotation ?? 0;
    this.seatRotation = options.seatRotation ?? 0;

    // Check if the position is an instance of Vector3f
    if (options.position instanceof Vector3f) {
      this.position = options.position;
    } else {
      // If not, create a new Vector3f from the array
      this.position = new Vector3f(...(options.position || [0, 1, 0]));
    }
  }

  /**
   * Convert the rideable seat options to a JSON object.
   * @returns The rideable seat options as a JSON object.
   */
  public toJson(): RideableSeatOptions {
    // Convert the seat position to an array if it's not already
    const position =
      this.position instanceof Vector3f
        ? [this.position.x, this.position.y, this.position.z]
        : this.position;

    // Return the seat options as a JSON object
    return {
      index: this.index,
      driver: this.driver,
      position: position as [number, number, number],
      lockRotation: this.lockRotation,
      seatRotation: this.seatRotation
    };
  }
}

export { RideableSeat, RideableSeatOptions };
