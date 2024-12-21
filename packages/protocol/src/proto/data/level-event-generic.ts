import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { NbtLoop } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LevelEventGeneric)
class LevelEventGenericPacket extends DataPacket {
  @Serialize(VarInt) public eventId!: number;
  @Serialize(NbtLoop) public nbtData!: NbtLoop;
}

export { LevelEventGenericPacket };
