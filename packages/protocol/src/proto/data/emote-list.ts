import { VarLong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Emotes } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.EmoteList)
class EmoteListPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(Emotes) public emoteIds!: Array<Emotes>;
}

export { EmoteListPacket };
