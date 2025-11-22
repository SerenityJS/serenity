import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddBehaviorTree)
class AddBehaviorTreePacket extends DataPacket {
  @Serialize(VarString) public treeStructureJson!: string;
}

export { AddBehaviorTreePacket };
