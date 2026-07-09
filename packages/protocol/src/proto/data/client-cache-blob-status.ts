import { Endianness, Uint64, VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { TypeArray } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientCacheBlobStatus)
class ClientCacheBlobStatusPacket extends DataPacket {
  @Serialize(TypeArray(Uint64, VarInt), { endian: Endianness.Little })
  public missHashes!: Array<bigint>;

  @Serialize(TypeArray(Uint64, VarInt), { endian: Endianness.Little })
  public hitHashes!: Array<bigint>;
}

export { ClientCacheBlobStatusPacket };
