import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataDrivenUIShowScreenPacket)
class ClientboundDataDrivenUIShowScreenPacket extends DataPacket {
  /**
   * Identifier of the screen to be shown.
   */
  public screenId!: string;

  public data!: Buffer;

  public serialize(): Buffer {
    this.writeVarInt(Packet.ClientboundDataDrivenUIShowScreenPacket);
    this.writeVarString(this.screenId);
    this.write(this.data);
    return this.getBuffer();
  }

  public deserialize(): this {
    this.screenId = this.readVarString();
    const length = this.getBuffer().byteLength - this.offset;
    this.data = this.read(length);
    return this;
  }
}

export { ClientboundDataDrivenUIShowScreenPacket };
