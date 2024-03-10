import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackResponses } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackResponse)
class ItemStackResponse extends DataPacket {
	@Serialize(ItemStackResponses) public responses!: Array<ItemStackResponses>;
}

export { ItemStackResponse };
