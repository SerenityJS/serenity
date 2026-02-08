import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { DataStoreUpdate } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerboundDataStore)
class ServerboundDataStorePacket extends DataPacket {
  /**
   * The update information for the data store update, which includes the name of the data store, the property that was updated, the path of the property, the new value of the property, and the update counts for both the property and the path. This information is used to update the client with the new value of the property after the update and to determine if an update is out of order or if an update was missed.
   */
  @Serialize(DataStoreUpdate)
  public update!: DataStoreUpdate;
}

export { ServerboundDataStorePacket };
