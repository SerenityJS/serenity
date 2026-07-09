import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { PresenceInfo } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerPresenceInfo)
class ServerPresenceInfoPacket extends DataPacket {
  public presenceInfo: PresenceInfo | null = null;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.ServerPresenceInfo);
    this.writeBool(this.presenceInfo !== null);

    if (this.presenceInfo !== null) {
      PresenceInfo.write(this, this.presenceInfo);
    }

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt();
    this.presenceInfo = this.readBool() ? PresenceInfo.read(this) : null;

    return this;
  }
}

export { ServerPresenceInfoPacket };
