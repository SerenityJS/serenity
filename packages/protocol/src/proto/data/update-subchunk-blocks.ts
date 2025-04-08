import { Proto, Serialize } from "@serenityjs/raknet";
import { ZigZag } from "@serenityjs/binarystream";

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
