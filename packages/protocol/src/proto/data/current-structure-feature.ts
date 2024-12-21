import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CurrentStructureFeature)
class CurrectStructureFeaturePacket extends DataPacket {
  @Serialize(VarString) public featureId!: string;
}

export { CurrectStructureFeaturePacket };
