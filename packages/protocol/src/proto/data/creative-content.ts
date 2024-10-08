import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CreativeItems, type NetworkItemInstanceDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CreativeContent)
class CreativeContentPacket extends DataPacket {
  @Serialize(CreativeItems) public items!: Array<NetworkItemInstanceDescriptor>;
}

export { CreativeContentPacket };
