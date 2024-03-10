import { Uint8, ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.RequestChunkRadius)
class RequestChunkRadius extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
	@Serialize(Uint8) public maxRadius!: number;
}

export { RequestChunkRadius };
