import {
  Endianness,
  Float32,
  VarLong,
  Uint8,
  VarString
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { AnimateSwingSourceType, type AnimateType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.Animate)
class AnimatePacket extends DataPacket {
  /**
   * The type of the animation.
   */
  @Serialize(Uint8) public type!: AnimateType;

  /**
   * The runtime ID of the entity.
   */
  @Serialize(VarLong) public actorRuntimeId!: bigint;

  /**
   * The data of the animation.
   */
  @Serialize(Float32, { endian: Endianness.Little })
  public data!: number;

  /**
   * The swing source type of the animation.
   */
  @Serialize(VarString, { optional: true })
  public swingSourceType!: AnimateSwingSourceType | null;
}

export { AnimatePacket };
