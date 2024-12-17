import { Uint8, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, PredictionType } from "../../enums";
import { PlayerInputTick, Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CorrectPlayerMovePrediction)
class CorrectPlayerMovePredictionPacket extends DataPacket {
  @Serialize(Uint8) public prediction!: PredictionType;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Vector3f) public velocity!: Vector3f;
  @Serialize(Bool) public onGround!: boolean;
  @Serialize(PlayerInputTick) public inputTick!: PlayerInputTick;
}

export { CorrectPlayerMovePredictionPacket };
