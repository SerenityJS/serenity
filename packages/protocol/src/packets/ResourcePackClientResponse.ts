import { Uint8 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, ResourceStatus } from '../enums/index.js';
import { ResourcePackIds } from '../types/index.js';

@Packet(PacketId.ResourcePackClientResponse)
class ResourcePackClientResponse extends DataPacket {
	@Serialize(Uint8) public status!: ResourceStatus;
	@Serialize(ResourcePackIds) public packIds!: string[];
}

export { ResourcePackClientResponse };
