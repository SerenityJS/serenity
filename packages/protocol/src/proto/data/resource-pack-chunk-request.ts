import { Endianness, Uint32, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackChunkRequest)
class ResourcePackChunkRequestPacket extends DataPacket {
  @Serialize(VarString) public packId!: string;
  @Serialize(Uint32, Endianness.Little) public chunkId!: number;
}

export { ResourcePackChunkRequestPacket };
