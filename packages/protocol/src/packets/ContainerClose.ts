import { Int8, Bool } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, WindowsIds } from '../enums/index.js';

@Packet(PacketId.ContainerClose)
class ContainerClose extends DataPacket {
	@Serialize(Int8) public windowId!: WindowsIds;
	@Serialize(Bool) public serverInitiated!: boolean;
}

export { ContainerClose };
