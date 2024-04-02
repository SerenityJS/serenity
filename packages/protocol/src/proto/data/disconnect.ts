import { ZigZag, VarString, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, DisconnectReason } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.Disconnect)
class DisconnectPacket extends DataPacket {
	@Serialize(ZigZag) public reason!: DisconnectReason;
	@Serialize(Bool) public hideDisconnectScreen!: boolean;
	@Serialize(VarString) public message!: string;
}

export { DisconnectPacket };
