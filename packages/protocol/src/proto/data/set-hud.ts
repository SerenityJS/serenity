import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { HUDElement } from "../types";
import { HUDVisibility } from "../../enums/hud-visibility";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetHud)
class SetHudPacket extends DataPacket {
	@Serialize(HUDElement) public hudElements!: Array<HUDElement>;
	@Serialize(VarInt) public visibility!: HUDVisibility;
}

export { SetHudPacket };
