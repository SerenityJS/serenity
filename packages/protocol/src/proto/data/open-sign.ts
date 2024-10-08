import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { BlockPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.OpenSign)
class OpenSignPacket extends DataPacket {
  @Serialize(BlockPosition)
  public position!: BlockPosition;

  @Serialize(Bool)
  public isFrontSide!: boolean;
}

export { OpenSignPacket };
