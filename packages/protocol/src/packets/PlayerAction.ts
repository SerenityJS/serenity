import { VarLong, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { ActionIds, Packet as PacketId } from '../enums';
import { BlockCoordinate, BlockCoordinates } from '../types';

@Packet(PacketId.PlayerAction)
class PlayerAction extends DataPacket {
	@Serialize(VarLong) public entityRuntimeId!: bigint;
	@Serialize(ZigZag) public action!: ActionIds;
	@Serialize(BlockCoordinates) public blockPosition!: BlockCoordinate;
	@Serialize(BlockCoordinates) public resultPosition!: BlockCoordinate;
	@Serialize(ZigZag) public face!: number;
}

export { PlayerAction };
