import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.SetLocalPlayerAsInitialized)
class SetLocalPlayerAsInitialized extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { SetLocalPlayerAsInitialized };
