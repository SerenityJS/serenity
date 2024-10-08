import { Bool, Endianness, Uint64 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.NetworkStackLatency)
class NetworkStackLatencyPacket extends DataPacket {
  @Serialize(Uint64, Endianness.Little) public timestamp!: bigint;
  @Serialize(Bool) public fromServer!: boolean;
}

export { NetworkStackLatencyPacket };
