import { Proto, Serialize } from "@serenityjs/raknet";
import { ZigZag } from "@serenityjs/binarystream";

import { BlockCoordinates } from "../types";
import { BlockEventType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.BlockEvent)
class BlockEventPacket extends DataPacket {
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(ZigZag) public type!: BlockEventType;
	@Serialize(ZigZag) public data!: number;
}

export { BlockEventPacket };
