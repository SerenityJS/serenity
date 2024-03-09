import { Endianness, Int64, Uint8 } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { CommandPermissionLevel, Packet as PacketId, PermissionLevel } from '../enums/index.js';
import { AbilityLayers } from '../types/index.js';

@Packet(PacketId.UpdateAbilities)
class UpdateAbilities extends DataPacket {
	@Serialize(Int64, Endianness.Little) public entityUniqueId!: bigint;
	@Serialize(Uint8) public permissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPersmissionLevel!: CommandPermissionLevel;
	@Serialize(AbilityLayers) public abilities!: AbilityLayers[];
}

export { UpdateAbilities };
