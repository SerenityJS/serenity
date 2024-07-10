import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, VarInt } from "@serenityjs/binarystream";

import {
	InventoryLayout,
	InventoryLeftTab,
	InventoryRightTab,
	Packet
} from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetPlayerInventoryOptions)
class SetPlayerInventoryOptionsPacket extends DataPacket {
	@Serialize(VarInt) public leftTab!: InventoryLeftTab;
	@Serialize(VarInt) public rightTab!: InventoryRightTab;
	@Serialize(Bool) public filtering!: boolean;
	@Serialize(VarInt) public layout!: InventoryLayout;
	@Serialize(VarInt) public craftingLayout!: InventoryLayout;
}

export { SetPlayerInventoryOptionsPacket };
