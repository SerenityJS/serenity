import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ScriptDebugShape } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerScriptDebugDrawer)
class ServerScriptDebugDrawerPacket extends DataPacket {
  @Serialize(ScriptDebugShape) public shapes!: Array<ScriptDebugShape>;
}

export { ServerScriptDebugDrawerPacket };
