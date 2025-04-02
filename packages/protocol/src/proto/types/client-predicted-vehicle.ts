import { DataType } from "@serenityjs/raknet";

import { InputData } from "../../enums";

import { Vector2f } from "./vector2f";
import { PlayerAuthInputData } from "./player-auth-input-data";

import type { BinaryStream } from "@serenityjs/binarystream";

class ClientPredictedVehicle extends DataType {
  /**
   * The rotation of the vehicle.
   */
  public vehicleRotation: Vector2f;

  /**
   * The unique id of the vehicle actor.
   */
  public actorUniqueId: number;

  /**
   * Creates a new instance of the ClientPredictedVehicle class.
   * @param vehicleRotation The rotation of the vehicle.
   * @param actorUniqueId The unique id of the vehicle actor.
   */
  public constructor(vehicleRotation: Vector2f, actorUniqueId: number) {
    super();
    this.vehicleRotation = vehicleRotation;
    this.actorUniqueId = actorUniqueId;
  }

  public static read(
    stream: BinaryStream,
    _: unknown,
    data: PlayerAuthInputData
  ): ClientPredictedVehicle | null {
    // Check if the input data has the vehicle flag
    if (
      !PlayerAuthInputData.hasFlag(data, InputData.IsInClientPredictedVehicle)
    )
      return null;

    // Read the vehicle rotation
    const rotation = Vector2f.read(stream);

    // Read the unique id of the vehicle actor
    const vehicle = stream.readZigZag();

    // Return a new instance of this class with the rotation and vehicle
    return new ClientPredictedVehicle(rotation, vehicle);
  }

  public static write(
    stream: BinaryStream,
    value: ClientPredictedVehicle,
    _: unknown,
    data: PlayerAuthInputData
  ): void {
    // Check if the input data has the vehicle flag
    if (
      !PlayerAuthInputData.hasFlag(data, InputData.IsInClientPredictedVehicle)
    )
      return;

    // Write the vehicle rotation
    Vector2f.write(stream, value.vehicleRotation);

    // Write the unique id of the vehicle actor
    stream.writeZigZag(value.actorUniqueId);
  }
}

export { ClientPredictedVehicle };
