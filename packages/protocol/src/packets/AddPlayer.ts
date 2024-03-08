import { Endianness, Float32, Uuid, VarLong, VarString, ZigZag, Int64, Uint8, Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { CommandPermissionLevel, DeviceOS, Gamemode, Packet as PacketId, PermissionLevel } from '../enums/index.js';
import {
	EntityProperties,
	Item,
	MetadataDictionary,
	Vector3f,
	AbilityLayers,
	Links,
	Vector2f,
} from '../types/index.js';

@Packet(PacketId.AddPlayer)
class AddPlayer extends DataPacket {
	@Serialize(Uuid) public uuid!: string;
	@Serialize(VarString) public username!: string;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public platformChatId!: string;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector3f) public velocity!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Item) public heldItem!: Item;
	@Serialize(ZigZag) public gamemode!: Gamemode;
	@Serialize(MetadataDictionary) public metadata!: MetadataDictionary[];
	@Serialize(EntityProperties) public properties!: EntityProperties;
	@Serialize(Int64, Endianness.Little) public uniqueEntityId!: bigint;
	@Serialize(Uint8) public premissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPermission!: CommandPermissionLevel;
	@Serialize(AbilityLayers) public abilities!: AbilityLayers[];
	@Serialize(Links) public links!: Links[];
	@Serialize(VarString) public deviceId!: string;
	@Serialize(Int32, Endianness.Little) public deviceOS!: DeviceOS;
}

export { AddPlayer };
