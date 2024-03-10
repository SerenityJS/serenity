import { Bool } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { BehaviorPackInfo, TexturePackInfo, PackLinks } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePacksInfo)
class ResourcePacksInfo extends DataPacket {
	@Serialize(Bool) public mustAccept!: boolean;
	@Serialize(Bool) public hasScripts!: boolean;
	@Serialize(Bool) public forceServerPacks!: boolean;
	@Serialize(BehaviorPackInfo) public behaviorPacks!: Array<BehaviorPackInfo>;
	@Serialize(TexturePackInfo) public texturePacks!: Array<TexturePackInfo>;
	@Serialize(PackLinks) public links!: Array<PackLinks>;
}

export { ResourcePacksInfo };
