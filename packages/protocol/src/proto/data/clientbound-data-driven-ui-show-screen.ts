import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString, Uint32, Endianness } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientboundDataDrivenUIShowScreenPacket)
class ClientboundDataDrivenUIShowScreenPacket extends DataPacket {
  /**
   * Identifier of the screen to be shown.
   */
  @Serialize(VarString)
  public screenId!: string;

  /**
   * Optional form ID to associate with the screen, used for tracking and interaction purposes.
   */
  @Serialize(Uint32, { optional: true, endian: Endianness.Little })
  public formId?: number;
}

export { ClientboundDataDrivenUIShowScreenPacket };
