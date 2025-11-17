import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8 } from "@serenityjs/binarystream";

import {
  CodeBuilderCategory,
  CodeBuilderCodeStatus,
  CodeBuilderOperation,
  Packet
} from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.CodeBuilderSource)
class CodeBuilderSourcePacket extends DataPacket {
  @Serialize(Uint8) public operation!: CodeBuilderOperation;
  @Serialize(Uint8) public category!: CodeBuilderCategory;
  @Serialize(Uint8) public codeStatus!: CodeBuilderCodeStatus;
}

export { CodeBuilderSourcePacket };
