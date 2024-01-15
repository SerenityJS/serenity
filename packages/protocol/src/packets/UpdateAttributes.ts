import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { PlayerAttributes } from '../types';
import type { PlayerAttribute } from '../types';

@Packet(PacketId.UpdateAttributes)
class UpdateAttributes extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(PlayerAttributes) public attributes!: PlayerAttribute[];
	@Serialize(VarLong) public tick!: bigint;
}

export { UpdateAttributes };
