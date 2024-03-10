import { VarString } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ToastRequest)
class ToastRequest extends DataPacket {
	@Serialize(VarString) public title!: string;
	@Serialize(VarString) public message!: string;
}

export { ToastRequest };
