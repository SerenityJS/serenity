import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerToClientHandshake)
class ServerToClientHandshakePacket extends DataPacket {
  @Serialize(VarString) public token!: string;
}

export { ServerToClientHandshakePacket };
