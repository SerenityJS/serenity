import { DataPacket } from "../..";
import { ZigZag } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";
import { Gamemode, Packet } from "../../enums";

@Proto(Packet.SetDefaultGamemode)
export class SetDefaultGamemodePacket extends DataPacket {
	@Serialize(ZigZag) public gamemode!: Gamemode;
}
