import { Proto, Serialize } from "@serenityjs/raknet";
import { Float64, VarInt, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { AnimateEntity } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AnimateEntity)
class AnimateEntityPacket extends DataPacket {
  @Serialize(VarString) public animation!: string;
  @Serialize(VarString) public nextState!: string;
  @Serialize(VarString) public stopExpression!: string;
  @Serialize(VarInt) public stopExpressionVersion!: number;
  @Serialize(VarString) public controller!: string;
  @Serialize(Float64) public blendOutTime!: number;
  @Serialize(AnimateEntity) public actorRuntimeIds!: AnimateEntity;
}

export { AnimateEntityPacket };
