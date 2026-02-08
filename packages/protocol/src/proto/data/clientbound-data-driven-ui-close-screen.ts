import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataDrivenUIClosePacket)
class ClientboundDataDrivenUIClosePacket extends DataPacket {
  /**
   * TODO: investigate what this field represents
   */
  @Serialize(VarInt)
  private data: number = 0;
}

export { ClientboundDataDrivenUIClosePacket };
