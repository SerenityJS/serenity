import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, WindowsIds } from "../../enums";
import { ItemStacks } from "../data";

import { DataPacket } from "./data-packet";

import type { Item } from "../data";

@Proto(Packet.InventoryContent)
class InventoryContent extends DataPacket {
	@Serialize(VarInt) public windowId!: WindowsIds;
	@Serialize(ItemStacks) public items!: Array<Item>;
}

export { InventoryContent };
