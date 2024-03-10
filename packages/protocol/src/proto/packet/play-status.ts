import { Int32 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, PlayerStatus } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayStatus)
class PlayStatus extends DataPacket {
	@Serialize(Int32) public status!: PlayerStatus;
}

export { PlayStatus };
