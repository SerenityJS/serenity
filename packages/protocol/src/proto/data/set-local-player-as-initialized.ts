import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetLocalPlayerAsInitialized)
class SetLocalPlayerAsInitializedPacket extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { SetLocalPlayerAsInitializedPacket };
