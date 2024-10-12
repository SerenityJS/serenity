import { VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type PlayerActionType, Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerAction)
class PlayerActionPacket extends DataPacket {
  @Serialize(VarLong) public entityRuntimeId!: bigint;
  @Serialize(ZigZag) public action!: PlayerActionType;
  @Serialize(BlockPosition) public blockPosition!: BlockPosition;
  @Serialize(BlockPosition) public resultPosition!: BlockPosition;
  @Serialize(ZigZag) public face!: number;
}

export { PlayerActionPacket };
