import { Endianness, Int64, Uint8 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { CommandPermissionLevel, Packet as PacketId, PermissionLevel } from '../enums';
import type { AbilityLayer } from '../types';
import { AbilityLayers } from '../types';

@Packet(PacketId.UpdateAbilities)
class UpdateAbilities extends DataPacket {
	@Serialize(Int64, Endianness.Little) public entityUniqueId!: bigint;
	@Serialize(Uint8) public permissionLevel!: PermissionLevel;
	@Serialize(Uint8) public commandPersmissionLevel!: CommandPermissionLevel;
	@Serialize(AbilityLayers) public abilities!: AbilityLayer[];
}

export { UpdateAbilities };
