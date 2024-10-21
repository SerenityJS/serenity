import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { GameRules } from "../types";
import { Packet } from "../../enums";

@Proto(Packet.GameRulesChanged)
class GameRulesChangedPacket extends DataPacket {
  @Serialize(GameRules) public rules!: GameRules;
}

export { GameRulesChangedPacket };
