import { Proto, Serialize } from "@serenityjs/raknet";
import { Byte, VarString, ZigZong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { EmoteFlags } from "../../enums/emote-flag";

import { DataPacket } from "./data-packet";

@Proto(Packet.Emote)
class EmotePacket extends DataPacket {
	@Serialize(ZigZong) public entityRuntimeId!: bigint;
	@Serialize(VarString) public emoteId!: string;
	@Serialize(VarString) public xboxUserId!: string;
	@Serialize(VarString) public platformChatId!: string;
	@Serialize(Byte) public flags!: EmoteFlags;
}

export { EmotePacket };
