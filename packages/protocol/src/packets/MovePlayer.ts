import { Float32, Endianness, Uint8, Bool, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { MoveMode, Packet as PacketId } from '../enums';
import type { TeleportCauseEntry } from '../types';
import { Vec3f, Vector3f, TeleportCause } from '../types';

@Packet(PacketId.MovePlayer)
class MovePlayer extends DataPacket {
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(Vector3f) public position!: Vec3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Uint8) public mode!: MoveMode;
	@Serialize(Bool) public onGround!: boolean;
	@Serialize(VarLong) public riddenRuntimeId!: bigint;
	@Serialize(TeleportCause) public cause!: TeleportCauseEntry | null;
	@Serialize(VarLong) public tick!: bigint;
}

export { MovePlayer };
