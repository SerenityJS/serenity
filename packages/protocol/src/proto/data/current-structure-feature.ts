import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { Packet } from "../../enums";

@Proto(Packet.CurrentStructureFeature)
class CurrectStructureFeaturePacket extends DataPacket {
  @Serialize(VarString) public featureId!: string;
}

export { CurrectStructureFeaturePacket };
