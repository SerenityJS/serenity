import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackRequests } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackRequest)
class ItemStackRequest extends DataPacket {
	@Serialize(ItemStackRequests) public requests!: Array<ItemStackRequests>;
}

export { ItemStackRequest };
