import { VarLong, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { ActionIds, Packet as PacketId } from '../enums/index.js';
import { BlockCoordinates } from '../types/index.js';

@Packet(PacketId.PlayerAction)
class PlayerAction extends DataPacket {
	@Serialize(VarLong) public entityRuntimeId!: bigint;
	@Serialize(ZigZag) public action!: ActionIds;
	@Serialize(BlockCoordinates) public blockPosition!: BlockCoordinates;
	@Serialize(BlockCoordinates) public resultPosition!: BlockCoordinates;
	@Serialize(ZigZag) public face!: number;
}

export { PlayerAction };
