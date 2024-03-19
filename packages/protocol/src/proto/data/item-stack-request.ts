import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackRequests } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackRequest)
class ItemStackRequestPacket extends DataPacket {
	@Serialize(ItemStackRequests) public requests!: Array<ItemStackRequests>;
}

export { ItemStackRequestPacket };
