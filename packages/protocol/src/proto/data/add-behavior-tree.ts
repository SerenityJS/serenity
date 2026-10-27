import { VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddBehaviorTree)
class AddBehaviorTreePacket extends DataPacket {
  @Serialize(VarString) public treeStructureJson!: string;
}

export { AddBehaviorTreePacket };
