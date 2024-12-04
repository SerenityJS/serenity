import { Bool, Uuid, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { TexturePackInfo } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePacksInfo)
class ResourcePacksInfoPacket extends DataPacket {
  @Serialize(Bool) public mustAccept!: boolean;
  @Serialize(Bool) public hasAddons!: boolean;
  @Serialize(Bool) public hasScripts!: boolean;
  @Serialize(Uuid) public worldTemplateUuid!: string;
  @Serialize(VarString) public worldTemplateVersion!: string;
  @Serialize(TexturePackInfo) public packs!: Array<TexturePackInfo>;
}

export { ResourcePacksInfoPacket };
