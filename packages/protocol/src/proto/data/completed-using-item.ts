import { Proto, Serialize } from "@serenityjs/raknet";
import { Short, ZigZag } from "@serenityjs/binarystream";

import { ItemUseMethod, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CompletedUsingItem)
class CompletedUsingItemPacket extends DataPacket {
	@Serialize(Short)
	public itemId!: number;

	@Serialize(ZigZag)
	public itemUseMethod!: ItemUseMethod;
}

export { CompletedUsingItemPacket };
