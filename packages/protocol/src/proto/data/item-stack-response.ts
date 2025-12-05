import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackResponseInfo } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackResponse)
class ItemStackResponsePacket extends DataPacket {
  @Serialize(ItemStackResponseInfo)
  public responses!: Array<ItemStackResponseInfo>;
}

export { ItemStackResponsePacket };
