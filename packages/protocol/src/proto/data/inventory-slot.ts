import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ContainerId } from "../../enums";
import { NetworkItemStackDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.InventorySlot)
class InventorySlotPacket extends DataPacket {
	@Serialize(VarInt) public containerId!: ContainerId;
	@Serialize(VarInt) public slot!: number;
	@Serialize(VarInt) public dynamicContainerId!: number;
	@Serialize(NetworkItemStackDescriptor)
	public item!: NetworkItemStackDescriptor;
}

export { InventorySlotPacket };
