import { Float32, Endianness, Uint8, Bool, VarLong, VarInt } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { MoveMode, Packet as PacketId } from '../enums/index.js';
import { Vector3f, TeleportCause, Vector2f } from '../types/index.js';

@Packet(PacketId.PlayerAuthInput)
class PlayerAuthInput extends DataPacket {
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector2f) public motion!: Vector2f;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(VarLong) public inputData!: bigint;
	@Serialize(VarInt) public inputMode!: number;
}

export { PlayerAuthInput };
