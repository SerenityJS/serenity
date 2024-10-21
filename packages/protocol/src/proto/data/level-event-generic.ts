import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { Packet } from "../../enums";
import { DataPacket } from "./data-packet";
import { NbtLoop } from "../types";

@Proto(Packet.LevelEventGeneric)
class LevelEventGenericPacket extends DataPacket {
  @Serialize(VarInt) public eventId!: number;
  @Serialize(NbtLoop) public nbtData!: NbtLoop;
}

export { LevelEventGenericPacket };
