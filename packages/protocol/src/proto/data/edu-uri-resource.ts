import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.EduUriResource)
class EduUriResourcePacket extends DataPacket {
  @Serialize(VarString) public buttonName!: string;
  @Serialize(VarString) public linkUri!: string;
}

export { EduUriResourcePacket };
