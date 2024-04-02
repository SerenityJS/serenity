import { Int8, Uint8, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { ContainerId, Packet } from "../../enums";
import { NetworkItemStackDescriptor } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MobEquipment)
class MobEquipmentPacket extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(NetworkItemStackDescriptor)
	public item!: NetworkItemStackDescriptor;

	@Serialize(Uint8) public slot!: number;
	@Serialize(Uint8) public selectedSlot!: number;
	@Serialize(Int8) public containerId!: ContainerId;
}

export { MobEquipmentPacket };
