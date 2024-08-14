import { ZigZag, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, DisconnectReason } from "../../enums";
import { DisconnectMessage } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Disconnect)
class DisconnectPacket extends DataPacket {
	@Serialize(ZigZag) public reason!: DisconnectReason;
	@Serialize(Bool) public hideDisconnectScreen!: boolean;
	@Serialize(DisconnectMessage, 0, "hideDisconnectScreen")
	public message!: DisconnectMessage;
}

export { DisconnectPacket };
