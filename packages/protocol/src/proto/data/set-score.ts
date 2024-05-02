import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ScoreEntry, ScoreActionType } from "../types/score-entry";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetScore)
class SetScorePacket extends DataPacket {
	@Serialize(VarInt) public type!: ScoreActionType;
	@Serialize(ScoreEntry) public entries!: Array<ScoreEntry>;
}

export { SetScorePacket };
