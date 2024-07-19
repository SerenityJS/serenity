import { Bool, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ServerboundLoadingScreenType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerboundLoadingScreenPacket)
class ServerboundLoadingScreenPacketPacket extends DataPacket {
	@Serialize(ZigZag) public type!: ServerboundLoadingScreenType;
	@Serialize(Bool) public hasScreenId!: boolean; // TODO: Implement the screen ID
}

export { ServerboundLoadingScreenPacketPacket };
