import { Uint32, Endianness } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataDrivenUIClosePacket)
class ClientboundDataDrivenUIClosePacket extends DataPacket {
  /**
   * Optional form ID to associate with the screen, used for tracking and interaction purposes.
   */
  @Serialize(Uint32, { optional: true, endian: Endianness.Little })
  public formId?: number;
}

export { ClientboundDataDrivenUIClosePacket };
