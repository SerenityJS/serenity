import { VarLong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetLocalPlayerAsInitialized)
class SetLocalPlayerAsInitialized extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { SetLocalPlayerAsInitialized };
