import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { BlockCoordinates, ChunkCoords } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.NetworkChunkPublisherUpdate)
class NetworkChunkPublisherUpdate extends DataPacket {
	@Serialize(BlockCoordinates) public coordinate!: BlockCoordinates;
	@Serialize(VarInt) public radius!: number;
	@Serialize(ChunkCoords) public savedChunks!: Array<ChunkCoords>;
}

export { NetworkChunkPublisherUpdate };
