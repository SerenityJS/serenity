import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { InputData } from "../../enums";

import { Vector2f } from "./vector2f";

import type { PlayerAuthInputData } from "./player-auth-input-data";

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

  // NOTE: Since v2168, the vehicle rotation and the vehicle actor are two separate optionals,
  // each preceded by a presence flag.

  public static read(
    stream: BinaryStream,
    _options?: PacketDataTypeOptions<PlayerAuthInputData>
  ): ClientPredictedVehicle | null {
    // Read the optional vehicle rotation
    const rotation = stream.readBool() ? Vector2f.read(stream) : null;

    // Read the optional unique id of the vehicle actor
    const vehicle = stream.readBool() ? Number(stream.readZigZong()) : null;

    // Return null if the player is not in a client predicted vehicle
    if (rotation === null && vehicle === null) return null;

    // Return a new instance of this class with the rotation and vehicle
    return new ClientPredictedVehicle(
      rotation ?? new Vector2f(0, 0),
      vehicle ?? 0
    );
  }

  public static write(
    stream: BinaryStream,
    value: ClientPredictedVehicle | null,
    options?: PacketDataTypeOptions<PlayerAuthInputData>
  ): void {
    // The vehicle data is only present when the input data has the vehicle flag
    const present =
      value !== null &&
      (options?.parameter?.hasFlag(InputData.IsInClientPredictedVehicle) ??
        false);

    // Write the optional vehicle rotation
    stream.writeBool(present);
    if (present) Vector2f.write(stream, value.vehicleRotation);

    // Write the optional unique id of the vehicle actor
    stream.writeBool(present);
    if (present) stream.writeZigZong(BigInt(value.actorUniqueId));
  }
}

export { ClientPredictedVehicle };
