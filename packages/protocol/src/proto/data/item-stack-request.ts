import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ItemStackRequest } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ItemStackRequest)
class ItemStackRequestPacket extends DataPacket {
	@Serialize(ItemStackRequest) public requests!: Array<ItemStackRequest>;
}

export { ItemStackRequestPacket };
