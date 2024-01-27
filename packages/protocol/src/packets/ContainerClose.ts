import { Int8, Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, WindowsIds } from '../enums';

@Packet(PacketId.ContainerClose)
class ContainerClose extends DataPacket {
	@Serialize(Int8) public windowId!: WindowsIds;
	@Serialize(Bool) public serverInitiated!: boolean;
}

export { ContainerClose };
