import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemRegistry)
class ItemRegistryPacket extends DataPacket {
  /**
   * The item type definitions that are registered within the item registry.
   */
  @Serialize(ItemData) public definitions!: Array<ItemData>;
}

export { ItemRegistryPacket };
