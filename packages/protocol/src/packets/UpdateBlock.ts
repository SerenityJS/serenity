import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, UpdateBlockFlagsType, UpdateBlockLayerType } from '../enums/index.js';
import { BlockCoordinates } from '../types/index.js';

@Packet(PacketId.UpdateBlock)
class UpdateBlock extends DataPacket {
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(VarInt) public blockRuntimeId!: number;
	@Serialize(VarInt) public flags!: UpdateBlockFlagsType;
	@Serialize(VarInt) public layer!: UpdateBlockLayerType;
}

export { UpdateBlock };
