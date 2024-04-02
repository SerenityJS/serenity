import { Bool, VarLong, ZigZong } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import {
	MetadataDictionary,
	Vector3f,
	NetworkItemStackDescriptor
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddItemActor)
class AddItemActorPacket extends DataPacket {
	@Serialize(ZigZong) public uniqueId!: bigint;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(NetworkItemStackDescriptor)
	public item!: NetworkItemStackDescriptor;

	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector3f) public velocity!: Vector3f;
	@Serialize(MetadataDictionary) public metadata!: Array<MetadataDictionary>;
	@Serialize(Bool) public fromFishing!: boolean;
}

export { AddItemActorPacket };
