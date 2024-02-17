import { Int8, ZigZong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, WindowsIds, WindowsTypes } from '../enums/index.js';
import { BlockCoordinates } from '../types/index.js';

@Packet(PacketId.ContainerOpen)
class ContainerOpen extends DataPacket {
	@Serialize(Int8) public windowId!: WindowsIds;
	@Serialize(Int8) public windowType!: WindowsTypes;
	@Serialize(BlockCoordinates) public position!: BlockCoordinates;
	@Serialize(ZigZong) public targetRuntimeEntityId!: bigint;
}

export { ContainerOpen };
