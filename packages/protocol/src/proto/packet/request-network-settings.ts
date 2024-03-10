import { Int32 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.RequestNetworkSettings)
class RequestNetworkSettings extends DataPacket {
	@Serialize(Int32) public protocol!: number;
}

export { RequestNetworkSettings };
