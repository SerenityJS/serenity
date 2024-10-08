import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BlockActorData)
class BlockActorDataPacket extends DataPacket {
  @Serialize(BlockPosition) public position!: BlockPosition;
  @Serialize(CompoundTag, true) public nbt!: CompoundTag<unknown>;
}

export { BlockActorDataPacket };
