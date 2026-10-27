import { VarInt } from "@serenityjs/binarystream";

import {
  Packet,
  type UpdateBlockFlagsType,
  type UpdateBlockLayerType
} from "../../enums";
import { Proto, Serialize } from "../../decorators";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateBlock)
class UpdateBlockPacket extends DataPacket {
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(VarInt) public networkBlockId!: number;
  @Serialize(VarInt) public flags!: UpdateBlockFlagsType;
  @Serialize(VarInt) public layer!: UpdateBlockLayerType;
}

export { UpdateBlockPacket };
