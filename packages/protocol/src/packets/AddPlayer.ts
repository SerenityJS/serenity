import { Endianness, Float32, VarInt, VarLong, VarString, ZigZong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { Vec2f, Vec3f, Vector2f, Vector3f } from '../types';

@Packet(PacketId.AddPlayer)
class AddPlayer extends DataPacket {
	@Serialize(ZigZong) public uniqueEntityId!: bigint;
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(VarString) public entityType!: string;
	@Serialize(Vector3f) public position!: Vec3f;
	@Serialize(Vector2f) public velocity!: Vec2f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Float32, Endianness.Little) public bodyYaw!: number;
	@Serialize(VarInt) public attributes!: number; // TODO
	@Serialize(VarInt) public metadata!: number; // TODO
	@Serialize(VarInt) public properties!: number; // TODO
	@Serialize(VarInt) public links!: number; // TODO
}

export { AddPlayer };
