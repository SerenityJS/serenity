import { Uint8 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { LabTableReactionType, LabTableType, Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LabTable)
class LabTablePacket extends DataPacket {
  @Serialize(Uint8) public type!: LabTableType;
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(Uint8) public reaction!: LabTableReactionType;
}

export { LabTablePacket };
