import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { BlockCoordinates, ChunkCoords } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.NetworkChunkPublisherUpdate)
class NetworkChunkPublisherUpdatePacket extends DataPacket {
	@Serialize(BlockCoordinates) public coordinate!: BlockCoordinates;
	@Serialize(VarInt) public radius!: number;
	@Serialize(ChunkCoords) public savedChunks!: Array<ChunkCoords>;
}

export { NetworkChunkPublisherUpdatePacket };
