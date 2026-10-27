import { Float32 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerStats)
class ServerStatsPacket extends DataPacket {
  @Serialize(Float32) public serverTime!: number;
  @Serialize(Float32) public networkTime!: number;
}

export { ServerStatsPacket };
