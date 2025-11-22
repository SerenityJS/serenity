import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.GameTestResponse)
class GameTestResponsePacket extends DataPacket {
  @Serialize(Bool) public succeded!: boolean;
  @Serialize(VarString) public error!: string;
  @Serialize(VarString) public testName!: string;
}

export { GameTestResponsePacket };
