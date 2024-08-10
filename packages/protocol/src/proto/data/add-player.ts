import {
	Endianness,
	Float32,
	Uuid,
	VarLong,
	VarString,
	ZigZag,
	Int64,
	Uint8,
	Int32
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
	CommandPermissionLevel,
	DeviceOS,
	Gamemode,
	Packet,
	PermissionLevel
} from "../../enums";
import {
	PropertySyncData,
	DataItem,
	Vector3f,
	AbilityLayer,
	Links,
	NetworkItemStackDescriptor
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddPlayer)
class AddPlayerPacket extends DataPacket {
	@Serialize(Uuid) public uuid!: string;
	@Serialize(VarString) public username!: string;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public platformChatId!: string;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector3f) public velocity!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(NetworkItemStackDescriptor)
	public heldItem!: NetworkItemStackDescriptor;

	@Serialize(ZigZag) public gamemode!: Gamemode;
	@Serialize(DataItem) public data!: Array<DataItem>;
	@Serialize(PropertySyncData) public properties!: PropertySyncData;
	@Serialize(Int64, Endianness.Little) public uniqueEntityId!: bigint;
	@Serialize(Uint8) public premissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPermission!: CommandPermissionLevel;
	@Serialize(AbilityLayer) public abilities!: Array<AbilityLayer>;
	@Serialize(Links) public links!: Array<Links>;
	@Serialize(VarString) public deviceId!: string;
	@Serialize(Int32, Endianness.Little) public deviceOS!: DeviceOS;
}

export { AddPlayerPacket };
