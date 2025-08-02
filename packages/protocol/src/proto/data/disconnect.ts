import { ZigZag, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type DisconnectReason } from "../../enums";
import { DisconnectMessage } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Disconnect)
class DisconnectPacket extends DataPacket {
  @Serialize(ZigZag) public reason!: DisconnectReason;
  @Serialize(Bool) public hideDisconnectScreen!: boolean;
  @Serialize(DisconnectMessage, { parameter: "hideDisconnectScreen" })
  public message!: DisconnectMessage;
}

export { DisconnectPacket };
