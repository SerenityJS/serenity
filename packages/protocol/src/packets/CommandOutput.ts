import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, PlayerStatus } from '../enums/index.js';
import { CommandOutputData } from '../types/CommandOutputData.js';

// Incomplete serialization
@Packet(PacketId.CommandOutput)
class CommandOutput extends DataPacket {
	@Serialize(CommandOutputData) public originData!: CommandOutputData;
}

export { CommandOutput };
