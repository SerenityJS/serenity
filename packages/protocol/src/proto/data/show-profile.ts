import { VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ShowProfile)
class ShowProfilePacket extends DataPacket {
  @Serialize(VarString) public xuid!: string;
}

export { ShowProfilePacket };
