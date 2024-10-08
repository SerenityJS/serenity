import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";

import { BlockPosition, StructureEditorData } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.StructureBlockUpdate)
class StructureBlockUpdatePacket extends DataPacket {
  @Serialize(BlockPosition)
  public blockPosition!: BlockPosition;

  @Serialize(StructureEditorData)
  public structureEditData!: StructureEditorData;

  @Serialize(Bool)
  public trigger!: boolean;

  @Serialize(Bool)
  public isWaterLogged!: boolean;
}

export { StructureBlockUpdatePacket };
