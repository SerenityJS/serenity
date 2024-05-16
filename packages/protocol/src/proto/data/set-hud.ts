import { Proto, Serialize } from "@serenityjs/raknet";
import { VarInt } from "@serenityjs/binarystream";

import { Packet, HUDVisibility } from "../../enums";
import { HUDElement } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetHud)
class SetHudPacket extends DataPacket {
	@Serialize(HUDElement) public hudElements!: Array<HUDElement>;
	@Serialize(VarInt) public visibility!: HUDVisibility;
}

export { SetHudPacket };
