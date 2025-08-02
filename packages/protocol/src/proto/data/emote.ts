import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, VarInt, VarString, VarLong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

import type { EmoteFlags } from "../../enums/emote-flag";

@Proto(Packet.Emote)
class EmotePacket extends DataPacket {
  @Serialize(VarLong) public actorRuntimeId!: bigint;
  @Serialize(VarString) public emoteId!: string;
  @Serialize(VarInt) public tickLength!: number;
  @Serialize(VarString) public xuid!: string;
  @Serialize(VarString) public platformChatId!: string;
  @Serialize(Uint8) public flags!: EmoteFlags;
}

export { EmotePacket };
