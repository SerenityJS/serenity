import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { BlockCoordinates } from "../types";
import { ZigZag } from "@serenityjs/binarystream";
import { BlockEventType, Packet } from "../../enums";

@Proto(Packet.BlockEvent)
class BlockEventPacket extends DataPacket { 
  @Serialize(BlockCoordinates) public position!: BlockCoordinates; 
  @Serialize(ZigZag) public type!: BlockEventType;
  @Serialize(ZigZag) public data!: number;
}

export { BlockEventPacket };
