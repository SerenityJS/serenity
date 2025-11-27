import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, ZigZong } from "@serenityjs/binarystream";

import { AgentAnimationId, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AgentAnimation)
class AgentAnimationPacket extends DataPacket {
  @Serialize(Uint8) public agentAnimation!: AgentAnimationId;
  @Serialize(ZigZong) public actorRuntimeId!: bigint;
}

export { AgentAnimationPacket };
