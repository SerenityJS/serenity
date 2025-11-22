import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.EditorNetwork)
class EditorNetworkPacket extends DataPacket {
  @Serialize(Bool) public routeToManager!: boolean;
  @Serialize(CompoundTag) public binaryPayload!: CompoundTag;
}

export { EditorNetworkPacket };
