import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerStartItemCooldown)
class PlayerStartItemCooldownPacket extends DataPacket {
	@Serialize(VarString)
	public category!: string;

	@Serialize(VarInt)
	public duration!: number;
}

export { PlayerStartItemCooldownPacket };
