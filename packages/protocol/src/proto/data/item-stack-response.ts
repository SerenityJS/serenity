import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackResponses } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackResponse)
class ItemStackResponsePacket extends DataPacket {
	@Serialize(ItemStackResponses) public responses!: Array<ItemStackResponses>;
}

export { ItemStackResponsePacket };
