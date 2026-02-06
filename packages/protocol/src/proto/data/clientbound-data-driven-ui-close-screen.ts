import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataDrivenUIClosePacket)
class ClientboundDataDrivenUIClosePacket extends DataPacket {
  /**
   * Identifier of the screen to be shown.
   */
  public screenId!: string;

  public serialize(): Buffer {
    this.writeVarInt(Packet.ClientboundDataDrivenUIClosePacket);
    return this.getBuffer();
  }

  public deserialize(): this {
    this.screenId = this.readVarString();
    return this;
  }
}

export { ClientboundDataDrivenUIClosePacket };
