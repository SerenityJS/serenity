import { VarString, ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, TitleTypes } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetTitle)
class SetTitlePacket extends DataPacket {
	@Serialize(ZigZag) public type!: TitleTypes;
	@Serialize(VarString) public text!: string;
	@Serialize(ZigZag) public fadeInTime!: number;
	@Serialize(ZigZag) public stayTime!: number;
	@Serialize(ZigZag) public fadeOutTime!: number;
	@Serialize(VarString) public xuid!: string;
	@Serialize(VarString) public platformOnlineId!: string;
}

export { SetTitlePacket };
