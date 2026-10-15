import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { StoreEntryPointInfo } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerStoreInfo)
class ServerStoreInfoPacket extends DataPacket {
  public storeInfo: StoreEntryPointInfo | null = null;

  public override serialize(): Buffer {
    // Reset the offset, as the same packet may be serialized more than once (e.g. when broadcasting)
    this.offset = 0;

    this.writeVarInt(Packet.ServerStoreInfo);
    this.writeBool(this.storeInfo !== null);

    if (this.storeInfo !== null) {
      StoreEntryPointInfo.write(this, this.storeInfo);
    }

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt();
    this.storeInfo = this.readBool() ? StoreEntryPointInfo.read(this) : null;

    return this;
  }
}

export { ServerStoreInfoPacket };
