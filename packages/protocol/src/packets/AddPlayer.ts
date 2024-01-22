import { Endianness, Float32, Uuid, VarLong, VarString, ZigZag, Int64, Uint8, Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { CommandPermissionLevel, DeviceOS, Gamemode, Packet as PacketId, PermissionLevel } from '../enums';
import type { Metadata, AbilityLayer, Link } from '../types';
import {
	EntityProperties,
	Item,
	MetadataDictionary,
	Vec3f,
	Vector3f,
	EntityProperty,
	AbilityLayers,
	Links,
	Vector2f,
	Vec2f,
	ItemEntry,
} from '../types';

@Packet(PacketId.AddPlayer)
class AddPlayer<T = unknown> extends DataPacket {
	@Serialize(Uuid) public uuid!: string;
	@Serialize(VarString) public username!: string;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public platformChatId!: string;
	@Serialize(Vector3f) public position!: Vec3f;
	@Serialize(Vector3f) public velocity!: Vec3f;
	@Serialize(Vector2f) public rotation!: Vec2f;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Item) public heldItem!: ItemEntry;
	@Serialize(ZigZag) public gamemode!: Gamemode;
	@Serialize(MetadataDictionary) public metadata!: Metadata<T>[];
	@Serialize(EntityProperties) public properties!: EntityProperty;
	@Serialize(Int64, Endianness.Little) public uniqueEntityId!: bigint;
	@Serialize(Uint8) public premissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPermission!: CommandPermissionLevel;
	@Serialize(AbilityLayers) public abilities!: AbilityLayer[];
	@Serialize(Links) public links!: Link[];
	@Serialize(VarString) public deviceId!: string;
	@Serialize(Int32, Endianness.Little) public deviceOS!: DeviceOS;
}

export { AddPlayer };
