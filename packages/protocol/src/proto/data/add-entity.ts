import {
	Endianness,
	Float32,
	VarLong,
	VarString,
	ZigZong
} from "@serenityjs/binaryutils";
import { Serialize, Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import {
	EntityProperties,
	MetadataDictionary,
	Vector3f,
	EntityAttributes,
	Links
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddEntity)
class AddEntityPacket extends DataPacket {
	@Serialize(ZigZong) public uniqueEntityId!: bigint;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public identifier!: string;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector3f) public velocity!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Float32, Endianness.Little) public bodyYaw!: number;
	@Serialize(EntityAttributes) public attributes!: Array<EntityAttributes>;
	@Serialize(MetadataDictionary) public metadata!: Array<MetadataDictionary>;
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(Links) public links!: Array<Links>;
}

export { AddEntityPacket };
