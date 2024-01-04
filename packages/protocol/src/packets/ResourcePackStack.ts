import { Bool, VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import type { ResourceIdVersion, Experiment } from '../types';
import { ResourceIdVersions, Experiments } from '../types';

@Packet(PacketId.ResourcePackStack)
class ResourcePackStack extends DataPacket {
	@Serialize(Bool) public mustAccept!: boolean;
	@Serialize(ResourceIdVersions) public behaviorPacks!: ResourceIdVersion[];
	@Serialize(ResourceIdVersions) public texturePacks!: ResourceIdVersion[];
	@Serialize(VarString) public gameVersion!: string;
	@Serialize(Experiments) public experiments!: Experiment[];
	@Serialize(Bool) public experimentsPreviouslyToggled!: boolean;
}

export { ResourcePackStack };
