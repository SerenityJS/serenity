import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import {
  DataStoreChangeInfo,
  DataStoreChangeInfoEntry,
  TypeArray
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataStore)
class ClientboundDataStorePacket extends DataPacket {
  /**
   * The updates to be applied to the data store, represented as an array of DataStoreChangeInfo objects, which can include changes, removals, and clear operations.
   */
  @Serialize(TypeArray(DataStoreChangeInfoEntry, VarInt))
  public updates!: Array<DataStoreChangeInfo>;
}

export { ClientboundDataStorePacket };
