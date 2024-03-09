import { Uint8, VarLong } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { Rotation, Vector3f } from '../types/index.js';

@Packet(PacketId.MoveEntity)
class MoveEntity extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(Uint8) public flags!: number;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Rotation) public rotation!: Rotation;
}

export { MoveEntity };
