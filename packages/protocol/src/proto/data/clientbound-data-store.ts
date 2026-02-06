import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { DataStoreChangeInfoEntry, TypeArray } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataStore)
class ClientboundDataStorePacket extends DataPacket {
  @Serialize(TypeArray(DataStoreChangeInfoEntry, VarInt))
  public updates!: Array<DataStoreChangeInfoEntry>;
}

export { ClientboundDataStorePacket };
