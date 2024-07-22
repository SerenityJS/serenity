import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8 } from "@serenityjs/binarystream";

import { BookEditAction, Packet } from "../../enums";
import { BookActions } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BookEdit)
class BookEditPacket extends DataPacket {
	@Serialize(Uint8)
	public action!: BookEditAction;

	@Serialize(Uint8)
	public bookSlot!: number;

	@Serialize(BookActions, false, "action")
	public actions!: BookActions;
}

export { BookEditPacket };
