import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId } from "../../enums";
import { ItemStacks, NetworkItemStackDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventoryContent)
class InventoryContentPacket extends DataPacket {
	@Serialize(VarInt) public containerId!: ContainerId;
	@Serialize(ItemStacks) public items!: Array<NetworkItemStackDescriptor>;
	@Serialize(VarInt) public dynamicContainerId!: number;
}

export { InventoryContentPacket };
