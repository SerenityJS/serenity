import { Proto, Serialize } from "../../decorators";
import { GameRules } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.GameRulesChanged)
class GameRulesChangedPacket extends DataPacket {
  @Serialize(GameRules) public rules!: Array<GameRules>;
}

export { GameRulesChangedPacket };
