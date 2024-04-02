import { ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ChunkRadiusUpdate)
class ChunkRadiusUpdatePacket extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
}

export { ChunkRadiusUpdatePacket };
