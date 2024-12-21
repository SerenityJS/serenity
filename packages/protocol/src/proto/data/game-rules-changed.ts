import { Proto, Serialize } from "@serenityjs/raknet";

import { GameRules } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.GameRulesChanged)
class GameRulesChangedPacket extends DataPacket {
  @Serialize(GameRules) public rules!: GameRules;
}

export { GameRulesChangedPacket };
