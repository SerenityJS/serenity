import { Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import type { BehaviorPack, TexturePack, PackLink } from '../types';
import { BehaviorPackInfo, TexturePackInfo, PackLinks } from '../types';

@Packet(PacketId.ResourcePacksInfo)
class ResourcePacksInfo extends DataPacket {
	@Serialize(Bool) public mustAccept!: boolean;
	@Serialize(Bool) public hasScripts!: boolean;
	@Serialize(Bool) public forceServerPacks!: boolean;
	@Serialize(BehaviorPackInfo) public behaviorPacks!: BehaviorPack[];
	@Serialize(TexturePackInfo) public texturePacks!: TexturePack[];
	@Serialize(PackLinks) public links!: PackLink[];
}

export { ResourcePacksInfo };
