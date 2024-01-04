import { Uint8 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, ResourceStatus } from '../enums';
import { ResourcePackIds } from '../types';

@Packet(PacketId.ResourcePackClientResponse)
class ResourcePackClientResponse extends DataPacket {
	@Serialize(Uint8) public status!: ResourceStatus;
	@Serialize(ResourcePackIds) public packIds!: string[];
}

export { ResourcePackClientResponse };
