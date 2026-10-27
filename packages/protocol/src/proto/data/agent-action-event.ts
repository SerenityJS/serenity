import { VarInt, VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { AgentActionType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AgentActionEvent)
class AgentActionEventPacket extends DataPacket {
  @Serialize(VarString) public requestId!: string;
  @Serialize(VarInt) public action!: AgentActionType;
  @Serialize(VarString) public response!: string;
}

export { AgentActionEventPacket };
