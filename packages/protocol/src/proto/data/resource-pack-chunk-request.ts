import { Endianness, Uint32 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { RequestedResourcePack } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackChunkRequest)
class ResourcePackChunkRequestPacket extends DataPacket {
  @Serialize(RequestedResourcePack) public pack!: RequestedResourcePack;
  @Serialize(Uint32, { endian: Endianness.Little }) public chunkId!: number;
}

export { ResourcePackChunkRequestPacket };
