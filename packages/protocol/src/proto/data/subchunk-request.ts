import { Endianness, Uint32, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import {
  TypeArray,
  SubChunkPosition,
  SubChunkRequestPositionOffset
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SubChunkRequest)
export class SubChunkRequestPacket extends DataPacket {
  /**
   * The dimension of the subchunk request.
   */
  @Serialize(ZigZag)
  public dimension!: DimensionType;

  /**
   * The position of the subchunk request.
   */
  @Serialize(SubChunkPosition)
  public position!: SubChunkPosition;

  /**
   * The offsets of the subchunk request.
   */
  @Serialize(TypeArray(SubChunkRequestPositionOffset, Uint32), {
    endian: Endianness.Little
  })
  public offsets!: Array<SubChunkRequestPositionOffset>;
}
