import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { GraphicsOverrideParameterPayload } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.GraphicsOverrideParameter)
class GraphicsOverrideParameterPacket extends DataPacket {
  @Serialize(GraphicsOverrideParameterPayload)
  public payload!: GraphicsOverrideParameterPayload;
}

export { GraphicsOverrideParameterPacket };
