import { Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type ScoreboardActionType } from "../../enums";
import { ScoreEntry } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetScore)
class SetScorePacket extends DataPacket {
  @Serialize(Uint8) public type!: ScoreboardActionType;
  @Serialize(ScoreEntry, { parameter: "type" })
  public entries!: Array<ScoreEntry>;
}

export { SetScorePacket };
