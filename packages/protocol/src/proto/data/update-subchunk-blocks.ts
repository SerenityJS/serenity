import { ZigZag } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { SubchunkBlocks } from "../types";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateSubchunkBlocks)
export class UpdateSubchunkBlocksPacket extends DataPacket {
  @Serialize(ZigZag) public x!: number;
  @Serialize(ZigZag) public y!: number;
  @Serialize(ZigZag) public z!: number;
  @Serialize(SubchunkBlocks) public blocks!: SubchunkBlocks;
  @Serialize(SubchunkBlocks) public extra!: SubchunkBlocks;
}
