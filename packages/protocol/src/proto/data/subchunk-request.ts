import { ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import { SignedBlockPosition, SubChunkRequests } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SubChunkRequest)
export class SubChunkRequestPacket extends DataPacket {
  @Serialize(ZigZag)
  public dimension!: DimensionType;
  @Serialize(SignedBlockPosition)
  public position!: SignedBlockPosition;
  @Serialize(SubChunkRequests)
  public offsets!: Array<SubChunkRequests>;
}
