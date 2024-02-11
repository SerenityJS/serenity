import { Endianness, Uint8 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, RecordAction } from '../enums';
import { Records } from '../types';

@Packet(PacketId.PlayerList)
class PlayerList extends DataPacket {
	@Serialize(Uint8) public action!: RecordAction;
	@Serialize(Records, Endianness.Little, 'action') public records!: Records[];
}

export { PlayerList };
