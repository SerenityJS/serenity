import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { CommandDefinition, CommandDefinitionType } from '../types';

@Packet(PacketId.AvailableCommands)
class AvailableCommands extends DataPacket {
	@Serialize(CommandDefinitionType) public CommandDefinition!: CommandDefinition;
}

export { AvailableCommands };
