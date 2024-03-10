import { ZigZag, VarString, Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, DisconnectReason } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.Disconnect)
class Disconnect extends DataPacket {
	@Serialize(ZigZag) public reason!: DisconnectReason;
	@Serialize(Bool) public hideDisconnectionScreen!: boolean;
	@Serialize(VarString) public message!: string;
}

export { Disconnect };
