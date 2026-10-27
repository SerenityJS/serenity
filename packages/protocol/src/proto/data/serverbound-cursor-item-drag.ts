import { Uint8 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { type CursorItemDragState, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

/**
 * Sent by the client when a cursor item split drag starts or stops.
 */
@Proto(Packet.ServerboundCursorItemDrag)
class ServerboundCursorItemDragPacket extends DataPacket {
  /**
   * The state of the cursor item drag.
   */
  @Serialize(Uint8) public state!: CursorItemDragState;
}

export { ServerboundCursorItemDragPacket };
