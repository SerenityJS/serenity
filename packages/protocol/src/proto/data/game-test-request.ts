import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, Uint8, VarInt } from "@serenityjs/binarystream";

import { GameRuleType, Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.GameTestRequest)
class GameTestRequestPacket extends DataPacket {
  @Serialize(VarInt) public maxTestsPerBatch!: number;
  @Serialize(VarInt) public repeatCount!: number;
  @Serialize(Uint8) public rotation!: GameRuleType;
  @Serialize(Bool) public stopOnFaliure!: boolean;
  @Serialize(BlockPosition) public testPosition!: BlockPosition;
  @Serialize(VarInt) public testPerRow!: number;
  @Serialize(VarInt) public testName!: string;
}

export { GameTestRequestPacket };
