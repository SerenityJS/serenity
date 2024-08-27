import { DataType } from "@serenityjs/raknet";
import { Vector2f } from "./vector2f";
import { BinaryStream } from "@serenityjs/binarystream";

class ClientPredictedVehicle extends DataType {
  public rotation: Vector2f;
  public vehicle: number;

  constructor(rotation: Vector2f, vehicle: number) {
    super();
    this.rotation = rotation;
    this.vehicle = vehicle;
  }

  public static write(stream: BinaryStream, value: ClientPredictedVehicle): void {
    Vector2f.write(stream, value.rotation);     
    stream.writeZigZag(value.vehicle);
  }

  public static read(stream: BinaryStream): ClientPredictedVehicle {
    const rotation = Vector2f.read(stream);
    const vehicle = stream.readZigZag();
    return new ClientPredictedVehicle(rotation, vehicle);
  }
}

export { ClientPredictedVehicle }