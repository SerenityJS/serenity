import { Uint8, Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type TextPacketType, Packet } from "../../enums";
import { TextSource, TextParameters } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Text)
class TextPacket extends DataPacket {
  @Serialize(Uint8) public type!: TextPacketType;
  @Serialize(Bool) public needsTranslation!: boolean;
  @Serialize(TextSource, { parameter: "type" }) public source!: string | null;

  @Serialize(VarString) public message!: string;
  @Serialize(TextParameters, { parameter: "type" })
  public parameters!: Array<string> | null;

  @Serialize(VarString) public xuid!: string;
  @Serialize(VarString) public platformChatId!: string;
  @Serialize(VarString) public filtered!: string;
}

export { TextPacket };
