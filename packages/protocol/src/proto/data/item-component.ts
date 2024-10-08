import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ComponentItem } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemComponent)
class ItemComponentPacket extends DataPacket {
  @Serialize(ComponentItem) public items!: Array<ComponentItem>;
}

export { ItemComponentPacket };
