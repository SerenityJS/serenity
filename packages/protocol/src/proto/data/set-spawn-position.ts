import { Proto, Serialize } from "@serenityjs/raknet";
import { ZigZag } from "@serenityjs/binarystream";
import { BlockPosition } from "../types";
import { DataPacket } from "./data-packet";
import { Packet } from "../../enums";
import { SpawnType } from "../../enums";

@Proto(Packet.SetSpawnPosition)
class SetSpawnPositionPacket extends DataPacket {
  @Serialize(ZigZag) public spawnType!: SpawnType;
  @Serialize(BlockPosition) public playerPosition!: BlockPosition;
  @Serialize(ZigZag) public dimension!: number;
  @Serialize(BlockPosition) public worldPosition!: BlockPosition;
}

export { SetSpawnPositionPacket };
