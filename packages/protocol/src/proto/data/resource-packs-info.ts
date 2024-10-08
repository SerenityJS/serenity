import { Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { TexturePackInfo, PackLinks } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePacksInfo)
class ResourcePacksInfoPacket extends DataPacket {
  @Serialize(Bool) public mustAccept!: boolean;
  @Serialize(Bool) public hasAddons!: boolean;
  @Serialize(Bool) public hasScripts!: boolean;
  @Serialize(TexturePackInfo) public packs!: Array<TexturePackInfo>;
  @Serialize(PackLinks) public links!: Array<PackLinks>;
}

export { ResourcePacksInfoPacket };
