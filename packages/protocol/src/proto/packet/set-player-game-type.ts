import { ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Gamemode, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetPlayerGameType)
class SetPlayerGameType extends DataPacket {
	@Serialize(ZigZag) public gamemode!: Gamemode;
}

export { SetPlayerGameType };
