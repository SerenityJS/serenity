import { Endianness, Float32, VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { ClientPredictedVehicle } from "../types/client-predicted-vehicle";
import { PlayerAuthInputData } from "../types/player-auth-input-data";
import { Packet } from "../../enums";
import {
  PlayerInputTick,
  Vector2f,
  Vector3f,
  PlayerBlockActions,
  PlayerAuthItemStackRequest,
  PlayerAuthInputTransaction,
  type InputTransaction
} from "../types";

import { DataPacket } from "./data-packet";

import type { PlayMode } from "../../enums/play-mode";
import type { InputMode } from "../../enums/input-mode";
import type { InteractionMode } from "../../enums/interaction-mode";

@Proto(Packet.PlayerAuthInput)
export class PlayerAuthInputPacket extends DataPacket {
  @Serialize(Vector2f) public rotation!: Vector2f;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Vector2f) public motion!: Vector2f;
  @Serialize(Float32, { endian: Endianness.Little }) public headYaw!: number;
  @Serialize(PlayerAuthInputData) public inputData!: PlayerAuthInputData;
  @Serialize(VarInt) public inputMode!: InputMode;
  @Serialize(VarInt) public playMode!: PlayMode;
  @Serialize(VarInt) public interactionMode!: InteractionMode;
  @Serialize(Vector2f) public interactRotation!: Vector2f;
  @Serialize(PlayerInputTick) public inputTick!: bigint;
  @Serialize(Vector3f) public positionDelta!: Vector3f;
  @Serialize(PlayerAuthInputTransaction, { parameter: "inputData" })
  public inputTransaction!: InputTransaction | null;
  @Serialize(PlayerAuthItemStackRequest, { parameter: "inputData" })
  public itemStackRequest!: PlayerAuthItemStackRequest | null;
  @Serialize(PlayerBlockActions, { parameter: "inputData" })
  public blockActions!: PlayerBlockActions | null;
  @Serialize(ClientPredictedVehicle, { parameter: "inputData" })
  public predictedVehicle!: ClientPredictedVehicle | null;
  @Serialize(Vector2f) public analogueMotion!: Vector2f;
  @Serialize(Vector3f) public cameraOrientation!: Vector3f;
  @Serialize(Vector2f) public rawMoveVector!: Vector2f;
}
