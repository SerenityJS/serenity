import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ScoreboardIdentityAction } from "../../enums/scoreboard-identity-action";
import { ScoreboardIdentity } from "../types/scoreboard-identity";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetScoreboardIdentity)
class SetScoreboardIdentityPacket extends DataPacket {
	@Serialize(VarInt) public action!: ScoreboardIdentityAction;
	@Serialize(ScoreboardIdentity) public entries!: ScoreboardIdentity;
}

export { SetScoreboardIdentityPacket };
