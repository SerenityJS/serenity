import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Difficulty, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetDifficulty)
class SetDifficultyPacket extends DataPacket {
  @Serialize(VarInt) public difficulty!: Difficulty;
}

export { SetDifficultyPacket };
