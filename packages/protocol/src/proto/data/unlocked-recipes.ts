import { Proto, Serialize } from "@serenityjs/raknet";

import { UnlockedRecipesEntry } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.UnlockedRecipes)
class UnlockedRecipesPacket extends DataPacket {
  @Serialize(UnlockedRecipesEntry) public recipes!: UnlockedRecipesEntry;
}

export { UnlockedRecipesPacket };
