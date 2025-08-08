import { ZigZag, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type DisconnectReason } from "../../enums";
import { DisconnectMessage } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Disconnect)
class DisconnectPacket extends DataPacket {
  /**
   * The enumerated reason for the disconnection.
   */
  @Serialize(ZigZag) public reason!: DisconnectReason;

  /**
   * Whether the disconnect screen should be hidden.
   */
  @Serialize(Bool) public hideDisconnectScreen!: boolean;

  /**
   * The string message of the disconnect packet.
   * If `hideDisconnectScreen` is true, this will not be sent.
   * If `hideDisconnectScreen` is false, this will be sent as the disconnect message.
   */
  @Serialize(DisconnectMessage, { parameter: "hideDisconnectScreen" })
  public message!: DisconnectMessage;
}

export { DisconnectPacket };
