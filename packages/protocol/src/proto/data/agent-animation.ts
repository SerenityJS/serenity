import { Uint8, ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { AgentAnimationId, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AgentAnimation)
class AgentAnimationPacket extends DataPacket {
  @Serialize(Uint8) public agentAnimation!: AgentAnimationId;
  @Serialize(ZigZong) public actorRuntimeId!: bigint;
}

export { AgentAnimationPacket };
