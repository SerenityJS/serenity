import { ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { Packet } from "../../enums";
import { DataPacket } from "./data-packet";

@Proto(Packet.RiderJump)
class RiderJumpPacket extends DataPacket {
  @Serialize(ZigZag) public strength!: number;
}

export { RiderJumpPacket }