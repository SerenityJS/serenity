import { VarInt, VarString, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { DisplaySlotType } from "../../enums/display-slot-type";
import { ObjectiveSortOrder } from "../../enums/objective-sort-order";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetDisplayObjective)
class SetDisplayObjectivePacket extends DataPacket {
	@Serialize(VarString) public displaySlot!: DisplaySlotType;
	@Serialize(VarString) public objectiveName!: string;
	@Serialize(VarString) public displayName!: string;
	@Serialize(VarString) public criteriaName!: string;
	@Serialize(ZigZag) public sortOrder!: ObjectiveSortOrder;
}

export { SetDisplayObjectivePacket };
