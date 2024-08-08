import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, ScoreboardActionType } from "../../enums";
import { ScoreEntry } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetScore)
class SetScorePacket extends DataPacket {
	@Serialize(VarInt) public type!: ScoreboardActionType;
	@Serialize(ScoreEntry, 0, "type") public entries!: Array<ScoreEntry>;
}

export { SetScorePacket };
