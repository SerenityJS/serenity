import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { Difficulty } from "../../enums";
import { Packet } from "../../enums";

@Proto(Packet.SetDifficulty)
class SetDifficultyPacket extends DataPacket {
  @Serialize(VarInt) public difficulty!: Difficulty;
}

export { SetDifficultyPacket };
