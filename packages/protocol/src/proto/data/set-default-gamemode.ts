import { ZigZag } from "@serenityjs/binarystream";

import { Serialize, Proto } from "../../decorators";
import { DataPacket } from "../..";
import { Gamemode, Packet } from "../../enums";

@Proto(Packet.SetDefaultGamemode)
export class SetDefaultGamemodePacket extends DataPacket {
  @Serialize(ZigZag) public gamemode!: Gamemode;
}
