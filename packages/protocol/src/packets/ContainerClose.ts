import { Int8, Bool, VarString, Endianness, VarInt, ZigZong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, WindowsIds, WindowsTypes } from '../enums';
import { BlockCoordinates } from '../types';

@Packet(PacketId.ContainerClose)
class ContainerClose extends DataPacket {
	@Serialize(Int8) public WindowId!: WindowsIds;
	@Serialize(Bool) public ServerInitiated!: boolean;
}

export { ContainerClose };
