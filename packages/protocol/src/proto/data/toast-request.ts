import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ToastRequest)
class ToastRequestPacket extends DataPacket {
	@Serialize(VarString) public title!: string;
	@Serialize(VarString) public message!: string;
}

export { ToastRequestPacket };
