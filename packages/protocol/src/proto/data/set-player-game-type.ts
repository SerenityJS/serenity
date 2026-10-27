import { ZigZag } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { type Gamemode, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetPlayerGameType)
class SetPlayerGameTypePacket extends DataPacket {
  @Serialize(ZigZag) public gamemode!: Gamemode;
}

export { SetPlayerGameTypePacket };
