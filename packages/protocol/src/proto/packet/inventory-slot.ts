import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, WindowsIds } from "../../enums";
import { Item } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventorySlot)
class InventorySlot extends DataPacket {
	@Serialize(VarInt) public windowId!: WindowsIds;
	@Serialize(VarInt) public slot!: number;
	@Serialize(Item) public item!: Item;
}

export { InventorySlot };
