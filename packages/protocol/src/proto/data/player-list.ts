import { Endianness, Uint8 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, RecordAction } from "../../enums";
import { Records } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerList)
class PlayerListPacket extends DataPacket {
	@Serialize(Uint8) public action!: RecordAction;
	@Serialize(Records, Endianness.Little, "action")
	public records!: Array<Records>;
}

export { PlayerListPacket };
