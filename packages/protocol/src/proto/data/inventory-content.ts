import { VarInt } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId } from "../../enums";
import { ItemStacks } from "../types";

import { DataPacket } from "./data-packet";

import type { Item } from "../types";

@Proto(Packet.InventoryContent)
class InventoryContentPacket extends DataPacket {
	@Serialize(VarInt) public containerId!: ContainerId;
	@Serialize(ItemStacks) public items!: Array<Item>;
}

export { InventoryContentPacket };
