import { Uint8, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, RespawnState } from '../enums/index.js';
import { Vector3f } from '../types/index.js';

@Packet(PacketId.Respawn)
class Respawn extends DataPacket {
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Uint8) public state!: RespawnState;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { Respawn };
