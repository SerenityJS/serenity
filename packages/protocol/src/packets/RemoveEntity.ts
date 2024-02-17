import { ZigZong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.RemoveEntity)
class RemoveEntity extends DataPacket {
	@Serialize(ZigZong) public uniqueEntityId!: bigint;
}

export { RemoveEntity };
