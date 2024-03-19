import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, WindowsIds } from "../../enums";
import { Item } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventorySlot)
class InventorySlotPacket extends DataPacket {
	@Serialize(VarInt) public windowId!: WindowsIds;
	@Serialize(VarInt) public slot!: number;
	@Serialize(Item) public item!: Item;
}

export { InventorySlotPacket };
