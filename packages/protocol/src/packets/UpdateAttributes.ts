import { VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { PlayerAttributes } from '../types/index.js';

@Packet(PacketId.UpdateAttributes)
class UpdateAttributes extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(PlayerAttributes) public attributes!: PlayerAttributes[];
	@Serialize(VarLong) public tick!: bigint;
}

export { UpdateAttributes };
