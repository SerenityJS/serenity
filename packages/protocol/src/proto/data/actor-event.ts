import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, VarLong, ZigZag } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ActorEvent)
class ActorEventPacket extends DataPacket {
	@Serialize(VarLong) public actorRuntimeId!: bigint;
	@Serialize(Uint8) public eventId!: number;
	@Serialize(ZigZag) public eventData!: number;
}

export { ActorEventPacket };
