import { Endianness, Uint8 } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, RecordAction } from '../enums/index.js';
import { Records } from '../types/index.js';

@Packet(PacketId.PlayerList)
class PlayerList extends DataPacket {
	@Serialize(Uint8) public action!: RecordAction;
	@Serialize(Records, Endianness.Little, 'action') public records!: Records[];
}

export { PlayerList };
