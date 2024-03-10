import { Uint8, Bool, VarString, Endianness } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { ChatTypes, Packet } from "../../enums";
import { TextSource, TextParameters } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.Text)
class Text extends DataPacket {
	@Serialize(Uint8) public type!: ChatTypes;
	@Serialize(Bool) public needsTranslation!: boolean;
	@Serialize(TextSource, Endianness.Little, "type") public source!:
		| string
		| null;

	@Serialize(VarString) public message!: string;
	@Serialize(TextParameters, Endianness.Little, "type")
	public parameters!: Array<string> | null;

	@Serialize(VarString) public xuid!: string;
	@Serialize(VarString) public platformChatId!: string;
}

export { Text };
