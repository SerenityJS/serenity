import { VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ScoreboardIdentity } from "../types/scoreboard-identity";

import { DataPacket } from "./data-packet";

import type { ScoreboardIdentityAction } from "../../enums/scoreboard-identity-action";

@Proto(Packet.SetScoreboardIdentity)
class SetScoreboardIdentityPacket extends DataPacket {
  @Serialize(VarInt) public action!: ScoreboardIdentityAction;
  @Serialize(ScoreboardIdentity) public entries!: ScoreboardIdentity;
}

export { SetScoreboardIdentityPacket };
