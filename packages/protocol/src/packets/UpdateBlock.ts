import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, UpdateBlockFlagsType, UpdateBlockLayerType } from '../enums';
import { BlockCoordinate, BlockCoordinates } from '../types';

@Packet(PacketId.UpdateBlock)
class UpdateBlock extends DataPacket {
	@Serialize(BlockCoordinates) public position!: BlockCoordinate;
	@Serialize(VarInt) public blockRuntimeId!: number;
	@Serialize(VarInt) public flags!: UpdateBlockFlagsType;
	@Serialize(VarInt) public layer!: UpdateBlockLayerType;
}

export { UpdateBlock };
