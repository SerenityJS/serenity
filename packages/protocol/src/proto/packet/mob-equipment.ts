import { Int8, Uint8, VarLong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Item } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.MobEquipment)
class MobEquipment extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(Item) public item!: Item;
	@Serialize(Uint8) public slot!: number;
	@Serialize(Uint8) public selectedSlot!: number;
	@Serialize(Int8) public windowId!: number;
}

export { MobEquipment };
