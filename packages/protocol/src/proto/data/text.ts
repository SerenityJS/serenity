import { Uint8, Bool, VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, TextVariantType } from "../../enums";
import { TextVariant } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Text)
class TextPacket extends DataPacket {
  @Serialize(Bool) public isLocalized!: boolean;
  @Serialize(Uint8) public variantType!: TextVariantType;

  @Serialize(TextVariant, { parameter: "variantType" })
  public variant!: TextVariant;

  @Serialize(VarString) public xuid!: string;
  @Serialize(VarString) public platformChatId!: string;
  @Serialize(VarString, { optional: true }) public filtered!: string | null;
}

export { TextPacket };
