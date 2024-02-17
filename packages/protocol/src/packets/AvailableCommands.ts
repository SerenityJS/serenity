import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { CommandDefinition, CommandDefinitionType } from '../types/index.js';

@Packet(PacketId.AvailableCommands)
class AvailableCommands extends DataPacket {
	@Serialize(CommandDefinitionType) public CommandDefinition!: CommandDefinition;
}

export { AvailableCommands };
