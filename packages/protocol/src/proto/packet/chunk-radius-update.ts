import { ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ChunkRadiusUpdate)
class ChunkRadiusUpdate extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
}

export { ChunkRadiusUpdate };
