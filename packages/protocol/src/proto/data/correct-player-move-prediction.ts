import { Uint8, Bool, Float32, Endianness } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, PredictionType } from "../../enums";
import { PlayerInputTick, Vector2f, Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CorrectPlayerMovePrediction)
class CorrectPlayerMovePredictionPacket extends DataPacket {
  @Serialize(Uint8) public prediction!: PredictionType;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Vector3f) public positionDelta!: Vector3f;
  @Serialize(Vector2f) public rotation!: Vector2f;
  @Serialize(Float32, { endian: Endianness.Little })
  public vehicleAngularVelocity!: number;

  @Serialize(Bool) public onGround!: boolean;
  @Serialize(PlayerInputTick) public inputTick!: PlayerInputTick;
}

export { CorrectPlayerMovePredictionPacket };
