import { Proto, Serialize } from "@serenityjs/raknet";
import { Byte, VarInt, ZigZong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ActorEvent)
class ActorEventPacket extends DataPacket {
	@Serialize(ZigZong) public actorRuntimeId!: bigint;
	@Serialize(Byte) public eventId!: number;
	@Serialize(VarInt) public eventData!: number;
}

export { ActorEventPacket };
