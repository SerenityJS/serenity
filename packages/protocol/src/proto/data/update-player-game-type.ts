import { ZigZag, ZigZong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { PlayerInputTick } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdatePlayerGameType)
export class UpdatePlayerGameTypePacket extends DataPacket {
  @Serialize(ZigZag) public gamemode!: number;
  @Serialize(ZigZong) public uniqueActorId!: bigint;
  @Serialize(PlayerInputTick) public inputTick!: PlayerInputTick;
}
