import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8 } from "@serenityjs/binarystream";

import { Packet, type HudVisibility } from "../../enums";
import { HudElementData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetHud)
class SetHudPacket extends DataPacket {
  @Serialize(HudElementData) public elements!: Array<HudElementData>;
  @Serialize(Uint8) public visibility!: HudVisibility;
}

export { SetHudPacket };
