import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.SetLocalPlayerAsInitialized)
class SetLocalPlayerAsInitialized extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { SetLocalPlayerAsInitialized };
