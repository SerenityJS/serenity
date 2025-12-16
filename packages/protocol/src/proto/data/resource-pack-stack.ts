import { Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ResourceIdVersions, Experiments } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackStack)
class ResourcePackStackPacket extends DataPacket {
  @Serialize(Bool) public mustAccept!: boolean;

  @Serialize(ResourceIdVersions)
  public texturePacks!: Array<ResourceIdVersions>;

  @Serialize(VarString) public gameVersion!: string;
  @Serialize(Experiments) public experiments!: Array<Experiments>;
  @Serialize(Bool) public experimentsPreviouslyToggled!: boolean;
  @Serialize(Bool) public hasEditorPacks!: boolean;
}

export { ResourcePackStackPacket };
