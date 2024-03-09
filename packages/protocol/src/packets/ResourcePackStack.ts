import { Bool, VarString } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { ResourceIdVersions, Experiments } from '../types/index.js';

@Packet(PacketId.ResourcePackStack)
class ResourcePackStack extends DataPacket {
	@Serialize(Bool) public mustAccept!: boolean;
	@Serialize(ResourceIdVersions) public behaviorPacks!: ResourceIdVersions[];
	@Serialize(ResourceIdVersions) public texturePacks!: ResourceIdVersions[];
	@Serialize(VarString) public gameVersion!: string;
	@Serialize(Experiments) public experiments!: Experiments[];
	@Serialize(Bool) public experimentsPreviouslyToggled!: boolean;
}

export { ResourcePackStack };
