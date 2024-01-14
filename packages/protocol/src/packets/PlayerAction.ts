import { Int8, Bool, VarString, Endianness, VarInt, ZigZong, VarLong, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, WindowsIds, WindowsTypes } from '../enums';
import { BlockCoordinates } from '../types';

@Packet(PacketId.PlayerAction)
class PlayerAction extends DataPacket {
	@Serialize(VarLong) public EntityRuntimeID!: bigint;
	@Serialize(ZigZag) public ActionType!: number;
	@Serialize(BlockCoordinates) public BlockPosition!: BlockCoordinates;
	@Serialize(BlockCoordinates) public ResultPosition!: BlockCoordinates;
	@Serialize(ZigZag) public Face!: number;
}

export { PlayerAction };
