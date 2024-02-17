import { Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, PlayerStatus } from '../enums/index.js';

@Packet(PacketId.PlayStatus)
class PlayStatus extends DataPacket {
	@Serialize(Int32) public status!: PlayerStatus;
}

export { PlayStatus };
