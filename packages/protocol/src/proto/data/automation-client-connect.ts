import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.AutomationClientConnect)
class AutomationClientConnectPacket extends DataPacket {
  @Serialize(VarString) public serverUri!: string;
}

export { AutomationClientConnectPacket };
