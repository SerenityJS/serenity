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
   * The form ID to associate with the screen, used for tracking and interaction purposes.
   */
  @Serialize(Uint32, { endian: Endianness.Little })
  public formId?: number;

  /**
   * Optional data instance ID to associate with the screen.
   */
  @Serialize(Uint32, { optional: true, endian: Endianness.Little })
  public dataInstanceId?: number;
}

export { ClientboundDataDrivenUIShowScreenPacket };
