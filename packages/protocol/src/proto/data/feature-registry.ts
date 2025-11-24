import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { FeatureDataList } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.FeatureRegistry)
class FeatureRegistryPacket extends DataPacket {
  @Serialize(FeatureDataList) public featureDataList!: FeatureDataList;
}

export { FeatureRegistryPacket };
