import { VarLong, VarString, Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { NpcRequestType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.NpcRequest)
class NpcRequestPacket extends DataPacket {
	@Serialize(VarLong) public runtimeActorId!: bigint;
	@Serialize(Uint8) public type!: NpcRequestType;
	@Serialize(VarString) public actions!: string;
	@Serialize(Uint8) public index!: number;
	@Serialize(VarString) public scene!: string;
}

export { NpcRequestPacket };
