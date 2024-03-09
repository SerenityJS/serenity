import { Float32, Endianness, Uint8, Bool, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { MoveMode, Packet as PacketId } from '../enums/index.js';
import { Vector3f, TeleportCause } from '../types/index.js';

@Packet(PacketId.MovePlayer)
class MovePlayer extends DataPacket {
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Uint8) public mode!: MoveMode;
	@Serialize(Bool) public onGround!: boolean;
	@Serialize(VarLong) public riddenRuntimeId!: bigint;
	@Serialize(TeleportCause, Endianness.Little) public cause!: TeleportCause | null;
	@Serialize(VarLong) public tick!: bigint;
}

export { MovePlayer };
