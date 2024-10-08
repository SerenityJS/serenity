import { Int32 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type PlayStatus } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayStatus)
class PlayStatusPacket extends DataPacket {
  @Serialize(Int32) public status!: PlayStatus;
}

export { PlayStatusPacket };
