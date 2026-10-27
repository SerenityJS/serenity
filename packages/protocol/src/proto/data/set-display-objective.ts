import { VarString, ZigZag } from "@serenityjs/binarystream";

import {
  Packet,
  type DisplaySlotType,
  type ObjectiveSortOrder
} from "../../enums";
import { Proto, Serialize } from "../../decorators";

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
