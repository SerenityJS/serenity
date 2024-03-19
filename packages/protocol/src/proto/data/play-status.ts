import { Int32 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, PlayStatus } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayStatus)
class PlayStatusPacket extends DataPacket {
	@Serialize(Int32) public status!: PlayStatus;
}

export { PlayStatusPacket };
