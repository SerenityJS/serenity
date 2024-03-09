import { Endianness } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { Commands, DynamicEnums, EnumConstraints, Enums, Subcommands, VarStringArray } from '../types/index.js';

@Packet(PacketId.AvailableCommands)
class AvailableCommands extends DataPacket {
	@Serialize(VarStringArray) public enumValues!: string[];
	@Serialize(VarStringArray) public subcommandValues!: string[];
	@Serialize(VarStringArray) public suffixes!: string[];
	@Serialize(Enums, Endianness.Little, 'enumValues') public enums!: Enums[];
	@Serialize(Subcommands) public subcommands!: Subcommands[];
	@Serialize(Commands) public commands!: Commands[];
	@Serialize(DynamicEnums) public dynamicEnums!: DynamicEnums[];
	@Serialize(EnumConstraints) public enumConstraints!: EnumConstraints[];
}

export { AvailableCommands };
